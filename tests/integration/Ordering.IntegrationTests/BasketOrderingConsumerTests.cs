using EventBus.Messages.Common;
using EventBus.Messages.Events;
using MassTransit;
using MassTransit.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordering.API.Extensions;
using Ordering.Application.Extensions;
using Ordering.Infrastructure.Data;
using Ordering.Infrastructure.Extensions;

namespace Ordering.IntegrationTests;

public class BasketOrderingConsumerTests(SqlServerFixture sql) : IClassFixture<SqlServerFixture>, IAsyncLifetime
{
    private ServiceProvider _provider = null!;
    private ITestHarness _harness = null!;
    private readonly CheckoutObserver _observer = new();

    public async Task InitializeAsync()
    {
        var connectionString = sql.NewDatabaseConnectionString();
        await using (var context = SqlServerFixture.CreateContext(connectionString))
            await context.Database.MigrateAsync();

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:OrderingConnectionString"] = connectionString
            })
            .Build();

        // Same application/infrastructure wiring and endpoint configuration as Program.cs,
        // with the in-memory transport instead of RabbitMQ.
        _provider = new ServiceCollection()
            .AddLogging()
            .AddApplicationServices()
            .AddInfraServices(configuration)
            .AddMassTransitTestHarness(x =>
            {
                x.AddOrderingConsumers();
                x.UsingInMemory((ctx, cfg) => cfg.ConfigureOrderingEndpoints(ctx));
            })
            .BuildServiceProvider();

        _harness = _provider.GetRequiredService<ITestHarness>();
        await _harness.Start();
        // The harness' Consumed list is keyed by MessageId, so count actual deliveries instead.
        _harness.Bus.ConnectConsumeMessageObserver(_observer);
    }

    public async Task DisposeAsync()
    {
        await _harness.Stop();
        await _provider.DisposeAsync();
    }

    [Fact]
    public async Task Redelivered_checkout_event_creates_a_single_order()
    {
        var checkout = NewCheckout();
        var messageId = NewId.NextGuid();

        // First delivery, then a broker redelivery (same MessageId) and a re-publish of the same
        // checkout (new MessageId, same CorrelationId).
        await DeliverAsync(checkout, messageId, expectedConsumed: 1);
        await DeliverAsync(checkout, messageId, expectedConsumed: 2);
        await DeliverAsync(checkout, NewId.NextGuid(), expectedConsumed: 3);

        await using var scope = _provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderContext>();
        (await db.Orders.CountAsync(o => o.CorrelationId == checkout.CorrelationId)).ShouldBe(1);

        _observer.Faulted.ShouldBe(0);
        (await _harness.Published.SelectAsync<OrderActivityEvent>().Count()).ShouldBe(1);
    }

    [Fact]
    public async Task Distinct_checkout_events_create_distinct_orders()
    {
        var first = NewCheckout();
        var second = NewCheckout();

        await DeliverAsync(first, NewId.NextGuid(), expectedConsumed: 1);
        await DeliverAsync(second, NewId.NextGuid(), expectedConsumed: 2);

        await using var scope = _provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderContext>();
        (await db.Orders.CountAsync(o => o.CorrelationId == first.CorrelationId || o.CorrelationId == second.CorrelationId))
            .ShouldBe(2);
    }

    private async Task DeliverAsync(BasketCheckoutEvent checkout, Guid messageId, int expectedConsumed)
    {
        var endpoint = await _harness.Bus.GetSendEndpoint(new Uri($"queue:{EventBusConstant.BasketCheckoutQueue}"));
        await endpoint.Send(checkout, ctx => ctx.MessageId = messageId);

        // Deliveries are processed one after another, as broker redeliveries are.
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        while (_observer.Completed < expectedConsumed)
            await Task.Delay(50, timeout.Token);
    }

    private sealed class CheckoutObserver : IConsumeMessageObserver<BasketCheckoutEvent>
    {
        private int _completed;
        private int _faulted;

        public int Completed => Volatile.Read(ref _completed);
        public int Faulted => Volatile.Read(ref _faulted);

        public Task PreConsume(ConsumeContext<BasketCheckoutEvent> context) => Task.CompletedTask;

        public Task PostConsume(ConsumeContext<BasketCheckoutEvent> context)
        {
            Interlocked.Increment(ref _completed);
            return Task.CompletedTask;
        }

        public Task ConsumeFault(ConsumeContext<BasketCheckoutEvent> context, Exception exception)
        {
            Interlocked.Increment(ref _faulted);
            Interlocked.Increment(ref _completed);
            return Task.CompletedTask;
        }
    }

    private static BasketCheckoutEvent NewCheckout() => new()
    {
        UserName = "slowey",
        TotalPrice = 750,
        FirstName = "phuc",
        LastName = "truong",
        EmailAddress = "user@example.com",
        AddressLine = "Ho Chi Minh city",
        Country = "Vietnam",
        State = "Ho Chi Minh",
        ZipCode = "700000",
        CardName = "Visa",
        CardNumber = "1234567890",
        Expiration = "12/25",
        Cvv = "123",
        PaymentMethod = 1
    };
}
