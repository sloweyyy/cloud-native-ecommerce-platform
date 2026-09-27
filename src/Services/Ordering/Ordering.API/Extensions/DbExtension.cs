using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Polly;
using Polly.Retry;

namespace Ordering.API.Extensions;

public static class DbExtension
{
    /// <summary>
    /// Applies pending EF Core migrations and runs <paramref name="seeder"/>, retrying transient
    /// database failures (e.g. SQL Server still starting). Any non-transient failure, or a
    /// transient one that persists after all retries, is logged as critical and rethrown so the
    /// process exits instead of serving traffic against an unmigrated database.
    /// </summary>
    public static async Task<IHost> MigrateDatabaseAsync<TContext>(this IHost host,
        Func<TContext, IServiceProvider, CancellationToken, Task> seeder,
        CancellationToken cancellationToken = default)
        where TContext : DbContext
    {
        var logger = host.Services.GetRequiredService<ILogger<TContext>>();
        var contextName = typeof(TContext).Name;

        var pipeline = new ResiliencePipelineBuilder()
            .AddRetry(new RetryStrategyOptions
            {
                ShouldHandle = new PredicateBuilder().Handle<Exception>(IsTransient),
                MaxRetryAttempts = 5,
                BackoffType = DelayBackoffType.Exponential,
                Delay = TimeSpan.FromSeconds(2),
                MaxDelay = TimeSpan.FromSeconds(30),
                UseJitter = true,
                OnRetry = args =>
                {
                    logger.LogWarning(args.Outcome.Exception,
                        "Migration of {DbContext} failed (attempt {Attempt}); retrying in {Delay}",
                        contextName, args.AttemptNumber + 1, args.RetryDelay);
                    return default;
                }
            })
            .Build();

        try
        {
            logger.LogInformation("Started Db Migration: {DbContext}", contextName);
            await pipeline.ExecuteAsync(async token =>
            {
                // Fresh scope per attempt so a failed attempt never reuses a broken DbContext.
                await using var scope = host.Services.CreateAsyncScope();
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<TContext>();
                await context.Database.MigrateAsync(token);
                await seeder(context, services, token);
            }, cancellationToken);
            logger.LogInformation("Migration Completed: {DbContext}", contextName);
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Database migration failed for {DbContext}; shutting down", contextName);
            throw;
        }

        return host;
    }

    /// <summary>
    /// Connection/timeout style failures, including the ones EF's retrying execution strategy
    /// wraps (<see cref="RetryLimitExceededException"/>, <see cref="DbUpdateException"/>).
    /// Deterministic errors such as pending model changes are not retried.
    /// </summary>
    private static bool IsTransient(Exception exception)
    {
        for (var ex = exception; ex is not null; ex = ex.InnerException)
        {
            if (ex is SqlException or TimeoutException or RetryLimitExceededException)
                return true;
        }

        return false;
    }
}
