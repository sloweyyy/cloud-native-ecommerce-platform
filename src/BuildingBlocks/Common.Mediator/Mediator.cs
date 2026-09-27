using System.Collections.Concurrent;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace Common.Mediator;

/// <summary>
/// Reflection-based in-process mediator. Resolves the matching
/// <see cref="IRequestHandler{TRequest, TResponse}"/> from the DI container and
/// composes any registered <see cref="IPipelineBehavior{TRequest, TResponse}"/>
/// instances around it (outer-most behavior registered first).
/// </summary>
internal sealed class Mediator(IServiceProvider serviceProvider) : IMediator
{
    private static readonly ConcurrentDictionary<Type, RequestInvoker> Cache = new();

    public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var invoker = Cache.GetOrAdd(request.GetType(), static reqType => RequestInvoker.Build(reqType));
        return invoker.Invoke<TResponse>(serviceProvider, request, cancellationToken);
    }

    private sealed class RequestInvoker
    {
        private readonly Type _handlerInterface;
        private readonly Type _behaviorInterface;
        private readonly MethodInfo _handleMethod;
        private readonly MethodInfo _behaviorHandleMethod;

        private RequestInvoker(Type requestType, Type responseType)
        {
            _handlerInterface = typeof(IRequestHandler<,>).MakeGenericType(requestType, responseType);
            _behaviorInterface = typeof(IPipelineBehavior<,>).MakeGenericType(requestType, responseType);
            _handleMethod = _handlerInterface.GetMethod(nameof(IRequestHandler<IRequest<object>, object>.Handle))!;
            _behaviorHandleMethod = _behaviorInterface.GetMethod(nameof(IPipelineBehavior<IRequest<object>, object>.Handle))!;
        }

        public static RequestInvoker Build(Type requestType)
        {
            var iface = Array.Find(
                requestType.GetInterfaces(),
                i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRequest<>))
                ?? throw new InvalidOperationException(
                    $"Type {requestType.FullName} does not implement IRequest<>.");
            var responseType = iface.GetGenericArguments()[0];
            return new RequestInvoker(requestType, responseType);
        }

        public Task<TResponse> Invoke<TResponse>(IServiceProvider sp, object request, CancellationToken ct)
        {
            var handler = sp.GetRequiredService(_handlerInterface);
            var behaviors = ((IEnumerable<object>)sp.GetServices(_behaviorInterface)).ToArray();

            // Innermost call: handler.Handle(request, ct)
            RequestHandlerDelegate<TResponse> next = () =>
                (Task<TResponse>)_handleMethod.Invoke(handler, new[] { request, ct })!;

            // Wrap behaviors from inside out, so the first-registered behavior runs first.
            for (var i = behaviors.Length - 1; i >= 0; i--)
            {
                var behavior = behaviors[i];
                var inner = next;
                next = () =>
                    (Task<TResponse>)_behaviorHandleMethod.Invoke(behavior, new object[] { request, inner, ct })!;
            }

            return next();
        }
    }
}
