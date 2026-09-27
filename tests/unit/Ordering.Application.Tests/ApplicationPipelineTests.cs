using Common.Mediator;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Ordering.Application.Commands;
using Ordering.Application.Extensions;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.Application.Tests;

/// <summary>
/// Runs commands through the real registration (mediator + validation behaviour) with a
/// scoped repository, the same shape as OrderContext-backed repositories in the API.
/// </summary>
public class ApplicationPipelineTests
{
    private readonly IOrderRepository _repository = Substitute.For<IOrderRepository>();

    private ServiceProvider BuildProvider()
    {
        var services = new ServiceCollection();
        services.AddSingleton(typeof(ILogger<>), typeof(NullLogger<>));
        services.AddScoped(_ => _repository);
        services.AddScoped(_ => Substitute.For<IActivityRepository>());
        services.AddApplicationServices();
        return services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true, ValidateOnBuild = true });
    }

    [Fact]
    public async Task Invalid_checkout_throws_ValidationException_before_reaching_the_handler()
    {
        await using var provider = BuildProvider();
        await using var scope = provider.CreateAsyncScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var ex = await Should.ThrowAsync<ValidationException>(
            () => mediator.Send(new CheckoutOrderCommand { UserName = "", TotalPrice = -0.5m }));

        ex.Errors.Select(e => e.PropertyName).ShouldContain(nameof(CheckoutOrderCommand.TotalPrice));
        await _repository.DidNotReceive().AddAsync(Arg.Any<Order>());
    }

    [Fact]
    public async Task Valid_checkout_reaches_the_handler()
    {
        _repository.AddAsync(Arg.Any<Order>()).Returns(call => call.Arg<Order>());
        await using var provider = BuildProvider();
        await using var scope = provider.CreateAsyncScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        await mediator.Send(new CheckoutOrderCommand
        {
            UserName = "alice",
            TotalPrice = 0m,
            FirstName = "Alice",
            LastName = "Smith",
            EmailAddress = "alice@example.com",
        });

        await _repository.Received(1).AddAsync(Arg.Any<Order>());
    }
}
