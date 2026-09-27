using Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Common.Api;

/// <summary>
/// Maps unhandled exceptions to RFC 7807 problem details:
/// <list type="bullet">
///   <item><see cref="ValidationException"/> → 400 with an <c>errors</c> dictionary</item>
///   <item><see cref="BadRequestException"/> / <see cref="BadHttpRequestException"/> → 400</item>
///   <item><see cref="NotFoundException"/> → 404</item>
///   <item><see cref="ConflictException"/> → 409</item>
///   <item>anything else → 500; exception details are only included in Development</item>
/// </list>
/// </summary>
public sealed class ProblemDetailsExceptionHandler(
    IProblemDetailsService problemDetailsService,
    IHostEnvironment environment,
    ILogger<ProblemDetailsExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception,
        CancellationToken cancellationToken)
    {
        var problem = CreateProblemDetails(exception);
        var status = problem.Status!.Value;

        // .NET 10 suppresses the middleware's own diagnostics once a handler returns true.
        if (status >= StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception for {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);
        else
            logger.LogInformation("Request {Method} {Path} failed with {StatusCode}: {Message}",
                httpContext.Request.Method, httpContext.Request.Path, status, exception.Message);

        httpContext.Response.StatusCode = status;
        var written = await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception,
        });

        // No writer accepted the request's Accept header: still return a JSON body.
        if (!written)
            await httpContext.Response.WriteAsJsonAsync(problem, problem.GetType(), (System.Text.Json.JsonSerializerOptions?)null,
                "application/problem+json", cancellationToken);

        return true;
    }

    private ProblemDetails CreateProblemDetails(Exception exception) => exception switch
    {
        ValidationException validation when validation.Errors.Any() => new ValidationProblemDetails(
            validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray()))
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "One or more validation errors occurred.",
        },
        ValidationException or BadRequestException => new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Bad request",
            Detail = exception.Message,
        },
        BadHttpRequestException badRequest => new ProblemDetails
        {
            Status = badRequest.StatusCode,
            Title = "Bad request",
            Detail = badRequest.Message,
        },
        NotFoundException => new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Resource not found",
            Detail = exception.Message,
        },
        ConflictException => new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Conflict",
            Detail = exception.Message,
        },
        _ => new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred.",
            // Never leak exception messages or stack traces outside Development.
            Detail = environment.IsDevelopment() ? exception.ToString() : null,
        },
    };
}
