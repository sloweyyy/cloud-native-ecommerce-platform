using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Common.Mediator;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers <see cref="IMediator"/> and all <see cref="IRequestHandler{TRequest, TResponse}"/>
    /// implementations discovered in the supplied assemblies as transient services.
    /// Mirrors the call shape of <c>AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(...))</c>.
    /// </summary>
    /// <remarks>
    /// The mediator is scoped so that handlers and behaviors are resolved from the
    /// caller's scope (HTTP request, MassTransit consume context, gRPC call). A singleton
    /// mediator would resolve them from the root provider, which throws under
    /// <c>ValidateScopes</c> and otherwise turns scoped dependencies such as a
    /// <c>DbContext</c> into process-wide singletons.
    /// </remarks>
    public static IServiceCollection AddMediator(this IServiceCollection services, params Assembly[] assemblies)
    {
        services.TryAddScoped<IMediator, Mediator>();

        var handlerInterface = typeof(IRequestHandler<,>);
        foreach (var asm in assemblies.Distinct())
        {
            foreach (var type in asm.GetTypes())
            {
                if (type.IsAbstract || type.IsInterface) continue;
                foreach (var iface in type.GetInterfaces())
                {
                    if (!iface.IsGenericType) continue;
                    if (iface.GetGenericTypeDefinition() == handlerInterface)
                    {
                        services.AddTransient(iface, type);
                    }
                }
            }
        }

        return services;
    }
}
