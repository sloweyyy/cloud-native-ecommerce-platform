using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Common.Api;

public static class ProblemDetailsExtensions
{
    /// <summary>
    /// Registers RFC 7807 problem details and the shared <see cref="ProblemDetailsExceptionHandler"/>.
    /// Pair with <see cref="UseApiExceptionHandler"/>.
    /// </summary>
    public static IServiceCollection AddApiProblemDetails(this IServiceCollection services)
    {
        services.AddProblemDetails();
        services.AddExceptionHandler<ProblemDetailsExceptionHandler>();
        return services;
    }

    /// <summary>
    /// Adds the exception handling middleware. Call it first in the pipeline so that it
    /// wraps every other middleware, and instead of <c>UseDeveloperExceptionPage</c>.
    /// </summary>
    public static IApplicationBuilder UseApiExceptionHandler(this IApplicationBuilder app) =>
        app.UseExceptionHandler();
}
