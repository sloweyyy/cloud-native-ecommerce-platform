using Discount.Core.Entities;
using Discount.Infrastructure.Extensions;
using Discount.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using Testcontainers.PostgreSql;

namespace Discount.IntegrationTests;

public sealed class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    public Task InitializeAsync() => _container.StartAsync();

    public Task DisposeAsync() => _container.DisposeAsync().AsTask();

    /// <summary>Connection string for a database that does not exist yet.</summary>
    public string NewDatabaseConnectionString() =>
        new NpgsqlConnectionStringBuilder(_container.GetConnectionString())
        {
            Database = $"discountdb_{Guid.NewGuid():N}"
        }.ConnectionString;
}

public class DiscountDbInitializationTests(PostgresFixture postgres) : IClassFixture<PostgresFixture>
{
    [Fact]
    public async Task Coupons_survive_a_second_startup_initialization()
    {
        var connectionString = postgres.NewDatabaseConnectionString();
        var repository = CreateRepository(connectionString);

        await DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance);
        (await repository.CreateDiscount(new Coupon { ProductName = "Created Via API", Description = "Test", Amount = 42 }))
            .ShouldBeTrue();

        await DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance);

        var coupon = await repository.GetDiscount("Created Via API");
        coupon.Amount.ShouldBe(42);
    }

    [Fact]
    public async Task Seeding_is_idempotent_and_does_not_resurrect_deleted_seed_coupons()
    {
        var connectionString = postgres.NewDatabaseConnectionString();
        var repository = CreateRepository(connectionString);

        await DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance);
        (await CountAsync(connectionString)).ShouldBe(2);

        await DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance);
        (await CountAsync(connectionString)).ShouldBe(2);

        (await repository.DeleteDiscount("ASUS ZenBook 13 OLED Ultrabook")).ShouldBeTrue();
        await DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance);
        (await CountAsync(connectionString)).ShouldBe(1);
    }

    [Fact]
    public async Task Concurrent_initialization_from_several_replicas_seeds_exactly_once()
    {
        var connectionString = postgres.NewDatabaseConnectionString();

        await Task.WhenAll(Enumerable.Range(0, 4)
            .Select(_ => Task.Run(() => DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance))));

        (await CountAsync(connectionString)).ShouldBe(2);
    }

    [Fact]
    public async Task ProductName_is_unique()
    {
        var connectionString = postgres.NewDatabaseConnectionString();
        var repository = CreateRepository(connectionString);
        await DbExtension.ApplyMigrationsAsync(connectionString, NullLogger.Instance);

        var ex = await Should.ThrowAsync<PostgresException>(() =>
            repository.CreateDiscount(new Coupon { ProductName = "ASUS ZenBook 13 OLED Ultrabook", Amount = 1 }));
        ex.SqlState.ShouldBe(PostgresErrorCodes.UniqueViolation);
    }

    private static DiscountRepository CreateRepository(string connectionString) =>
        new(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DatabaseSettings:ConnectionString"] = connectionString
            })
            .Build());

    private static async Task<long> CountAsync(string connectionString)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM Coupon", connection);
        return (long)(await cmd.ExecuteScalarAsync())!;
    }
}
