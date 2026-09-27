using Common.Logging;
using Common.Exceptions;
using Grpc.Core;
using Grpc.Core.Interceptors;

namespace Discount.API.Interceptors;

/// <summary>
/// gRPC counterpart of the shared HTTP problem-details handler: maps exceptions to
/// proper <see cref="StatusCode"/>s instead of a generic <c>Unknown</c>, and never
/// sends internal exception messages to the client outside Development.
/// </summary>
public class ExceptionInterceptor : Interceptor
{
    private readonly ILogger<ExceptionInterceptor> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionInterceptor(ILogger<ExceptionInterceptor> logger, IHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
    }

    public override async Task<TResponse> UnaryServerHandler<TRequest, TResponse>(
        TRequest request,
        ServerCallContext context,
        UnaryServerMethod<TRequest, TResponse> continuation)
    {
        try
        {
            return await continuation(request, context);
        }
        catch (RpcException)
        {
            // Already carries an explicit status (e.g. NotFound from a handler).
            throw;
        }
        catch (Exception ex)
        {
            throw ToRpcException(ex, context.Method);
        }
    }

    private RpcException ToRpcException(Exception exception, string method)
    {
        var code = exception switch
        {
            NotFoundException => StatusCode.NotFound,
            ConflictException => StatusCode.AlreadyExists,
            BadRequestException or ArgumentException => StatusCode.InvalidArgument,
            OperationCanceledException => StatusCode.Cancelled,
            _ => StatusCode.Internal,
        };

        if (code == StatusCode.Internal)
        {
            _logger.LogError(exception, "Unhandled exception in gRPC call {Method}", method);
            var detail = _environment.IsDevelopment() ? exception.ToString() : "An unexpected error occurred.";
            return new RpcException(new Status(code, detail, exception));
        }

        _logger.LogInformation("gRPC call {Method} failed with {StatusCode}: {Message}", method, code,
            LogSanitizer.Sanitize(exception.Message));
        return new RpcException(new Status(code, exception.Message, exception));
    }
}
