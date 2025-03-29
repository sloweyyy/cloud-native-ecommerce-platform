using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Threading;

namespace Discount.Infrastructure.Extensions;

public static class DbExtension
{
    public static IHost MigrateDatabase<TContext>(this IHost host)
    {
        using (var scope = host.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var config = services.GetRequiredService<IConfiguration>();
            var logger = services.GetRequiredService<ILogger<TContext>>();
            try
            {
                logger.LogInformation("Discount DB Migration Started");
                ApplyMigrations(config);
                logger.LogInformation("Discount DB Migration Completed");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while migrating the database.");
                throw;
            }
        }

        return host;
    }

    public static void ApplyMigrations(IConfiguration config)
    {
        var retry = 5;
        while (retry > 0)
            try
            {
                using var connection =
                    new NpgsqlConnection(config.GetValue<string>("DatabaseSettings:ConnectionString"));

                var builder = new NpgsqlConnectionStringBuilder(config.GetValue<string>("DatabaseSettings:ConnectionString"));
                var dbName = builder.Database;
                builder.Database = "postgres";

                using (var masterConnection = new NpgsqlConnection(builder.ConnectionString))
                {
                    masterConnection.Open();
                    using (var checkCmd = new NpgsqlCommand($"SELECT 1 FROM pg_database WHERE datname = '{dbName}'", masterConnection))
                    {
                        var exists = checkCmd.ExecuteScalar() != null;
                        if (!exists)
                        {
                            using var createCmd = new NpgsqlCommand($"CREATE DATABASE \"{dbName}\"", masterConnection);
                            createCmd.ExecuteNonQuery();
                        }
                    }
                }

                connection.Open();
                using var migrationCmd = new NpgsqlCommand
                {
                    Connection = connection
                };
                migrationCmd.CommandText = "DROP TABLE IF EXISTS Coupon";
                migrationCmd.ExecuteNonQuery();
                migrationCmd.CommandText = @"CREATE TABLE Coupon(Id SERIAL PRIMARY KEY, 
                                                ProductName VARCHAR(500) NOT NULL,
                                                Description TEXT,
                                                Amount INT)";
                migrationCmd.ExecuteNonQuery();

                migrationCmd.CommandText =
                    "INSERT INTO Coupon(ProductName, Description, Amount) VALUES('ASUS ZenBook 13 OLED Ultrabook', 'Laptop Discount', 500);";
                migrationCmd.ExecuteNonQuery();

                migrationCmd.CommandText =
                    "INSERT INTO Coupon(ProductName, Description, Amount) VALUES('ASUS ROG Zephyrus G14 Gaming Laptop', 'Laptop Discount', 700);";
                migrationCmd.ExecuteNonQuery();
                // Exit loop if successful
                break;
            }
            catch (Exception ex)
            {
                retry--;
                if (retry == 0) throw;
                //Wait for 2 seconds
                Thread.Sleep(2000);
            }
    }
}