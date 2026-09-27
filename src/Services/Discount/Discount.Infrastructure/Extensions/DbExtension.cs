using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Discount.Infrastructure.Extensions;

public static class DbExtension
{
    private const int MaxAttempts = 6;

    // Arbitrary application-wide key for pg_advisory_xact_lock; serialises schema
    // initialisation across replicas that start at the same time.
    private const long SchemaLockKey = 0x44697363_6F756E74; // "Discount"

    /// <summary>
    /// Creates the Discount database/schema if missing and seeds it once. Safe to run on every
    /// start and from multiple replicas concurrently. Throws (after logging) if the database
    /// cannot be initialised, so the process exits instead of serving without a schema.
    /// </summary>
    public static async Task<IHost> MigrateDatabaseAsync<TContext>(this IHost host,
        CancellationToken cancellationToken = default)
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;
        var config = services.GetRequiredService<IConfiguration>();
        var logger = services.GetRequiredService<ILogger<TContext>>();
        try
        {
            logger.LogInformation("Discount DB Migration Started");
            await ApplyMigrationsAsync(config.GetValue<string>("DatabaseSettings:ConnectionString")!, logger,
                cancellationToken);
            logger.LogInformation("Discount DB Migration Completed");
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Discount DB migration failed; shutting down");
            throw;
        }

        return host;
    }

    public static async Task ApplyMigrationsAsync(string connectionString, ILogger logger,
        CancellationToken cancellationToken = default)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await EnsureDatabaseAsync(connectionString, cancellationToken);
                await EnsureSchemaAndSeedAsync(connectionString, logger, cancellationToken);
                return;
            }
            catch (Exception ex) when (attempt < MaxAttempts && IsTransient(ex))
            {
                var delay = TimeSpan.FromSeconds(Math.Min(30, Math.Pow(2, attempt)));
                logger.LogWarning(ex, "Discount DB migration attempt {Attempt} failed; retrying in {Delay}",
                    attempt, delay);
                await Task.Delay(delay, cancellationToken);
            }
        }
    }

    private static bool IsTransient(Exception ex) =>
        ex is TimeoutException || ex is NpgsqlException { IsTransient: true };

    private static async Task EnsureDatabaseAsync(string connectionString, CancellationToken cancellationToken)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var dbName = builder.Database;
        builder.Database = "postgres";

        await using var connection = new NpgsqlConnection(builder.ConnectionString);
        await connection.OpenAsync(cancellationToken);

        await using var checkCmd = new NpgsqlCommand("SELECT 1 FROM pg_database WHERE datname = @name", connection);
        checkCmd.Parameters.AddWithValue("name", dbName!);
        if (await checkCmd.ExecuteScalarAsync(cancellationToken) != null)
            return;

        try
        {
            // Identifiers cannot be parameterised; quote and escape explicitly.
            await using var createCmd =
                new NpgsqlCommand($"CREATE DATABASE \"{dbName!.Replace("\"", "\"\"")}\"", connection);
            await createCmd.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.DuplicateDatabase)
        {
            // Another replica created it first.
        }
    }

    private static async Task EnsureSchemaAndSeedAsync(string connectionString, ILogger logger,
        CancellationToken cancellationToken)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var tx = await connection.BeginTransactionAsync(cancellationToken);

        await ExecuteAsync(connection, tx, "SELECT pg_advisory_xact_lock(@key)", cancellationToken,
            ("key", SchemaLockKey));

        await ExecuteAsync(connection, tx, @"
            CREATE TABLE IF NOT EXISTS Coupon(
                Id SERIAL PRIMARY KEY,
                ProductName VARCHAR(500) NOT NULL,
                Description TEXT,
                Amount INT)", cancellationToken);

        // One coupon per product. Tables created by older versions may already hold duplicates,
        // in which case we keep serving and leave the constraint for an operator to add.
        var hasDuplicates = (bool)(await ScalarAsync(connection, tx,
            "SELECT EXISTS (SELECT 1 FROM Coupon GROUP BY ProductName HAVING COUNT(*) > 1)",
            cancellationToken))!;
        if (hasDuplicates)
            logger.LogWarning(
                "Coupon table contains duplicate ProductName values; unique index ux_coupon_productname not created");
        else
            await ExecuteAsync(connection, tx,
                "CREATE UNIQUE INDEX IF NOT EXISTS ux_coupon_productname ON Coupon (ProductName)",
                cancellationToken);

        // Seed only an empty table so coupons deleted by an admin are not resurrected on restart.
        var isEmpty = !(bool)(await ScalarAsync(connection, tx, "SELECT EXISTS (SELECT 1 FROM Coupon)",
            cancellationToken))!;
        if (isEmpty)
        {
            await ExecuteAsync(connection, tx, @"
                INSERT INTO Coupon(ProductName, Description, Amount) VALUES
                    ('ASUS ZenBook 13 OLED Ultrabook', 'Laptop Discount', 500),
                    ('ASUS ROG Zephyrus G14 Gaming Laptop', 'Laptop Discount', 700)
                ON CONFLICT DO NOTHING", cancellationToken);
            logger.LogInformation("Coupon table seeded");
        }

        await tx.CommitAsync(cancellationToken);
    }

    private static async Task ExecuteAsync(NpgsqlConnection connection, NpgsqlTransaction tx, string sql,
        CancellationToken cancellationToken, params (string Name, object Value)[] parameters)
    {
        await using var cmd = new NpgsqlCommand(sql, connection, tx);
        foreach (var (name, value) in parameters)
            cmd.Parameters.AddWithValue(name, value);
        await cmd.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task<object?> ScalarAsync(NpgsqlConnection connection, NpgsqlTransaction tx, string sql,
        CancellationToken cancellationToken)
    {
        await using var cmd = new NpgsqlCommand(sql, connection, tx);
        return await cmd.ExecuteScalarAsync(cancellationToken);
    }
}
