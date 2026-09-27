using Microsoft.Extensions.DependencyInjection;

namespace Common.Mediator.Tests;

public class MediatorTests
{
    // Mirrors the Development host: ValidateScopes + ValidateOnBuild.
    private static ServiceProvider BuildProvider(Action<IServiceCollection>? configure = null)
    {
        var services = new ServiceCollection();
        services.AddScoped<ScopedDependency>();
        services.AddSingleton<CallLog>();
        services.AddMediator(typeof(MediatorTests).Assembly);
        configure?.Invoke(services);
        return services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateScopes = true,
            ValidateOnBuild = true,
        });
    }

    [Fact]
    public async Task Send_resolves_handler_with_scoped_dependency_under_ValidateScopes()
    {
        await using var provider = BuildProvider();
        await using var scope = provider.CreateAsyncScope();

        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
        var result = await mediator.Send(new Ping("hello"));

        result.ShouldBe("hello:" + scope.ServiceProvider.GetRequiredService<ScopedDependency>().Id);
    }

    [Fact]
    public void Mediator_is_scoped_and_cannot_be_resolved_from_root_provider()
    {
        using var provider = BuildProvider();

        // Regression: a singleton mediator resolved handlers from the root provider,
        // which throws "Cannot resolve scoped service ... from root provider".
        Should.Throw<InvalidOperationException>(() => provider.GetRequiredService<IMediator>());
    }

    [Fact]
    public async Task Each_scope_gets_its_own_scoped_dependencies()
    {
        await using var provider = BuildProvider();

        string first, second;
        await using (var scope = provider.CreateAsyncScope())
            first = await scope.ServiceProvider.GetRequiredService<IMediator>().Send(new Ping("x"));
        await using (var scope = provider.CreateAsyncScope())
            second = await scope.ServiceProvider.GetRequiredService<IMediator>().Send(new Ping("x"));

        first.ShouldNotBe(second);
    }

    [Fact]
    public async Task Pipeline_behaviors_run_in_registration_order_around_the_handler()
    {
        await using var provider = BuildProvider(services =>
        {
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(OuterBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(InnerBehavior<,>));
        });
        await using var scope = provider.CreateAsyncScope();

        await scope.ServiceProvider.GetRequiredService<IMediator>().Send(new Ping("x"));

        provider.GetRequiredService<CallLog>().Entries.ShouldBe(new[]
        {
            "outer:before", "inner:before", "handler", "inner:after", "outer:after",
        });
    }

    [Fact]
    public async Task Synchronously_thrown_handler_exception_is_not_wrapped()
    {
        await using var provider = BuildProvider();
        await using var scope = provider.CreateAsyncScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var ex = await Should.ThrowAsync<KeyNotFoundException>(() => mediator.Send(new Boom()));
        ex.Message.ShouldBe("boom");
    }

    [Fact]
    public async Task Unit_request_is_dispatched()
    {
        await using var provider = BuildProvider();
        await using var scope = provider.CreateAsyncScope();

        var result = await scope.ServiceProvider.GetRequiredService<IMediator>().Send(new Fire());

        result.ShouldBe(Unit.Value);
        provider.GetRequiredService<CallLog>().Entries.ShouldContain("fired");
    }

    [Fact]
    public async Task Send_without_registered_handler_throws()
    {
        await using var provider = BuildProvider();
        await using var scope = provider.CreateAsyncScope();

        await Should.ThrowAsync<InvalidOperationException>(
            () => scope.ServiceProvider.GetRequiredService<IMediator>().Send(new Unhandled()));
    }

    [Fact]
    public void AddMediator_called_twice_registers_a_single_mediator()
    {
        var services = new ServiceCollection();
        services.AddMediator();
        services.AddMediator();

        services.Count(d => d.ServiceType == typeof(IMediator)).ShouldBe(1);
        services.Single(d => d.ServiceType == typeof(IMediator)).Lifetime.ShouldBe(ServiceLifetime.Scoped);
    }
}

public sealed class ScopedDependency
{
    public Guid Id { get; } = Guid.NewGuid();
}

public sealed class CallLog
{
    public List<string> Entries { get; } = new();
}

public sealed record Ping(string Message) : IRequest<string>;

public sealed class PingHandler(ScopedDependency dependency, CallLog log) : IRequestHandler<Ping, string>
{
    public Task<string> Handle(Ping request, CancellationToken cancellationToken)
    {
        log.Entries.Add("handler");
        return Task.FromResult($"{request.Message}:{dependency.Id}");
    }
}

public sealed record Boom : IRequest<string>;

public sealed class BoomHandler : IRequestHandler<Boom, string>
{
    // Deliberately not async: the exception is thrown from the Invoke call itself.
    public Task<string> Handle(Boom request, CancellationToken cancellationToken) =>
        throw new KeyNotFoundException("boom");
}

public sealed record Fire : IRequest;

public sealed class FireHandler(CallLog log) : IRequestHandler<Fire, Unit>
{
    public Task<Unit> Handle(Fire request, CancellationToken cancellationToken)
    {
        log.Entries.Add("fired");
        return Unit.Task;
    }
}

public sealed record Unhandled : IRequest<int>;

public sealed class OuterBehavior<TRequest, TResponse>(CallLog log) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        log.Entries.Add("outer:before");
        var response = await next();
        log.Entries.Add("outer:after");
        return response;
    }
}

public sealed class InnerBehavior<TRequest, TResponse>(CallLog log) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        log.Entries.Add("inner:before");
        var response = await next();
        log.Entries.Add("inner:after");
        return response;
    }
}
