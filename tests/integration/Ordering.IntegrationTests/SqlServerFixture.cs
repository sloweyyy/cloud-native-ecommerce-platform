using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Ordering.Infrastructure.Data;
using Testcontainers.MsSql;

namespace Ordering.IntegrationTests;

/// <summary>
/// One SQL Server container per test class; each test gets its own database so tests stay
/// independent without paying the container start-up cost repeatedly.
/// </summary>
public sealed class SqlServerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _container = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    public Task InitializeAsync() => _container.StartAsync();

    public Task DisposeAsync() => _container.DisposeAsync().AsTask();

    /// <summary>Connection string for a database that does not exist yet.</summary>
    public string NewDatabaseConnectionString()
    {
        var builder = new SqlConnectionStringBuilder(_container.GetConnectionString())
        {
            InitialCatalog = $"OrderDb_{Guid.NewGuid():N}"
        };
        return builder.ConnectionString;
    }

    public static OrderContext CreateContext(string connectionString) =>
        new(new DbContextOptionsBuilder<OrderContext>()
            .UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure())
            .Options);
}
