namespace Common.Mediator;

/// <summary>Marker for a request with a typed response.</summary>
public interface IRequest<out TResponse> { }

/// <summary>Marker for a request with no meaningful response.</summary>
public interface IRequest : IRequest<Unit> { }

/// <summary>
/// Returned by request handlers that don't have a meaningful value to return.
/// Mirrors MediatR's <c>Unit</c> for source compatibility.
/// </summary>
public readonly struct Unit : IEquatable<Unit>
{
    public static Unit Value { get; } = default;
    public static Task<Unit> Task { get; } = System.Threading.Tasks.Task.FromResult(Value);

    public bool Equals(Unit other) => true;
    public override bool Equals(object? obj) => obj is Unit;
    public override int GetHashCode() => 0;
    public override string ToString() => "()";

    public static bool operator ==(Unit left, Unit right) => true;
    public static bool operator !=(Unit left, Unit right) => false;
}

/// <summary>Handles a request of type <typeparamref name="TRequest"/>.</summary>
public interface IRequestHandler<in TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken);
}

/// <summary>Delegate invoked by a pipeline behavior to continue execution.</summary>
public delegate Task<TResponse> RequestHandlerDelegate<TResponse>();

/// <summary>
/// Pipeline behavior interposed around request handlers. Mirrors MediatR's
/// <c>IPipelineBehavior&lt;TRequest, TResponse&gt;</c>.
/// </summary>
public interface IPipelineBehavior<in TRequest, TResponse>
    where TRequest : notnull
{
    Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken);
}

/// <summary>Sends requests to a single matching handler, optionally through a pipeline.</summary>
public interface IMediator
{
    Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default);
}
