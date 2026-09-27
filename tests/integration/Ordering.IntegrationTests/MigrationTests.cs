using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Ordering.API.Extensions;
using Ordering.Core.Entities;
using Ordering.Infrastructure.Data;
using Ordering.Infrastructure.Extensions;

namespace Ordering.IntegrationTests;

public class MigrationTests(SqlServerFixture sql) : IClassFixture<SqlServerFixture>
{
    private const string InitialCreate = "20240725154011_InitialCreate";

    [Fact]
    public void Model_has_no_pending_changes()
    {
        using var context = SqlServerFixture.CreateContext(sql.NewDatabaseConnectionString());

        context.Database.HasPendingModelChanges().ShouldBeFalse();
    }

    [Fact]
    public async Task Migrations_create_the_full_schema_on_a_fresh_database()
    {
        await using var context = SqlServerFixture.CreateContext(sql.NewDatabaseConnectionString());

        await context.Database.MigrateAsync();

        (await context.Database.GetPendingMigrationsAsync()).ShouldBeEmpty();
        (await context.Database.GetAppliedMigrationsAsync())
            .ShouldBe(context.Database.GetMigrations(), ignoreOrder: false);
        var tables = await TablesAsync(context);
        tables.ShouldContain("Orders");
        tables.ShouldContain("Activities");

        // The schema is usable end to end.
        context.Activities.Add(new Activity
        {
            EventId = Guid.NewGuid(), ActivityType = "Order.Created", EntityType = "Order", EntityId = "1",
            Title = "Order Created", SourceService = "Ordering", OccurredAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task Migrations_succeed_on_a_legacy_database_whose_Activities_table_came_from_the_seeder()
    {
        var connectionString = sql.NewDatabaseConnectionString();
        await using (var legacy = SqlServerFixture.CreateContext(connectionString))
        {
            // State of existing deployments: InitialCreate applied, Activities created by the
            // old OrderContextSeed raw-SQL fallback with no migration history row.
            await legacy.GetService<IMigrator>().MigrateAsync(InitialCreate);
            await legacy.Database.ExecuteSqlRawAsync(LegacyActivitiesDdl);
            await legacy.Database.ExecuteSqlRawAsync(
                "INSERT INTO [dbo].[Activities] ([EventId],[ActivityType],[EntityType],[EntityId],[Title],[SourceService],[OccurredAt]) " +
                "VALUES (NEWID(), 'Order.Created', 'Order', '1', 'Order Created', 'Ordering', SYSUTCDATETIME())");
        }

        await using var context = SqlServerFixture.CreateContext(connectionString);
        await context.Database.MigrateAsync();

        (await context.Database.GetPendingMigrationsAsync()).ShouldBeEmpty();
        (await context.Activities.CountAsync()).ShouldBe(1);
    }

    [Fact]
    public async Task Startup_migration_seeds_once_and_can_run_again()
    {
        using var host = BuildHost(sql.NewDatabaseConnectionString());

        for (var i = 0; i < 2; i++)
            await host.MigrateDatabaseAsync<OrderContext>((context, services, ct) =>
                OrderContextSeed.SeedAsync(context,
                    services.GetRequiredService<Microsoft.Extensions.Logging.ILogger<OrderContextSeed>>(), ct));

        await using var scope = host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderContext>();
        (await db.Orders.CountAsync()).ShouldBe(1);
    }

    [Fact]
    public async Task Startup_migration_fails_fast_on_non_transient_errors()
    {
        using var host = BuildHost(sql.NewDatabaseConnectionString());
        var attempts = 0;

        await Should.ThrowAsync<InvalidOperationException>(() =>
            host.MigrateDatabaseAsync<OrderContext>((_, _, _) =>
            {
                attempts++;
                throw new InvalidOperationException("boom");
            }));

        attempts.ShouldBe(1);
    }

    private static IHost BuildHost(string connectionString)
    {
        var builder = Host.CreateApplicationBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:OrderingConnectionString"] = connectionString
        });
        builder.Services.AddInfraServices(builder.Configuration);
        return builder.Build();
    }

    private static async Task<List<string>> TablesAsync(OrderContext context) =>
        await context.Database
            .SqlQueryRaw<string>("SELECT TABLE_NAME AS [Value] FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
            .ToListAsync();

    // Verbatim copy of the DDL the removed OrderContextSeed.EnsureActivitiesTableExistsAsync ran.
    private const string LegacyActivitiesDdl = @"
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Activities]') AND type in (N'U'))
        BEGIN
            CREATE TABLE [dbo].[Activities] (
                [Id] int IDENTITY(1,1) NOT NULL,
                [EventId] uniqueidentifier NOT NULL,
                [ActivityType] nvarchar(50) NOT NULL,
                [EntityType] nvarchar(50) NOT NULL,
                [EntityId] nvarchar(100) NOT NULL,
                [Title] nvarchar(200) NOT NULL,
                [Description] nvarchar(500) NULL,
                [Actor] nvarchar(100) NULL,
                [SourceService] nvarchar(50) NOT NULL,
                [Metadata] nvarchar(max) NULL,
                [OccurredAt] datetime2 NOT NULL,
                [CreatedBy] nvarchar(max) NULL,
                [CreatedDate] datetime2 NULL,
                [LastModifiedBy] nvarchar(max) NULL,
                [LastModifiedDate] datetime2 NULL,
                CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
                CONSTRAINT [UX_Activities_EventId] UNIQUE ([EventId])
            );

            CREATE INDEX [IX_Activities_CreatedDate] ON [dbo].[Activities] ([CreatedDate]);
            CREATE INDEX [IX_Activities_OccurredAt] ON [dbo].[Activities] ([OccurredAt]);
            CREATE INDEX [IX_Activities_ActivityType] ON [dbo].[Activities] ([ActivityType]);
            CREATE INDEX [IX_Activities_EntityType] ON [dbo].[Activities] ([EntityType]);
        END";
}
