using EventBus.Messages.Common;
using MassTransit;
using Ordering.API.EventBusConsumer;
using Ordering.Application.Exceptions;

namespace Ordering.API.Extensions;

public static class MassTransitExtensions
{
    public static IBusRegistrationConfigurator AddOrderingConsumers(this IBusRegistrationConfigurator config)
    {
        config.AddConsumer<BasketOrderingConsumer>();
        config.AddConsumer<BasketOrderingConsumerV2>();
        config.AddConsumer<ProductActivityConsumer>();
        config.AddConsumer<OrderActivityConsumer>();
        return config;
    }

    /// <summary>
    /// Transport-agnostic receive endpoint setup shared by Program.cs (RabbitMQ) and the
    /// integration tests (in-memory test harness).
    /// </summary>
    public static void ConfigureOrderingEndpoints(this IBusFactoryConfigurator cfg, IBusRegistrationContext ctx)
    {
        // Transient failures (e.g. SQL Server failover) are retried in-process with backoff before
        // the message is faulted to the _error queue. Consumers are idempotent, so retries and
        // broker redeliveries are safe.
        cfg.UseMessageRetry(r =>
        {
            r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(2));
            r.Ignore<ValidationException>();
        });

        cfg.ReceiveEndpoint(EventBusConstant.BasketCheckoutQueue,
            c => { c.ConfigureConsumer<BasketOrderingConsumer>(ctx); });
        // V2 Version
        cfg.ReceiveEndpoint(EventBusConstant.BasketCheckoutQueueV2,
            c => { c.ConfigureConsumer<BasketOrderingConsumerV2>(ctx); });
        // Activity queues
        cfg.ReceiveEndpoint(EventBusConstant.ProductActivityQueue,
            c => { c.ConfigureConsumer<ProductActivityConsumer>(ctx); });
        cfg.ReceiveEndpoint(EventBusConstant.OrderActivityQueue,
            c => { c.ConfigureConsumer<OrderActivityConsumer>(ctx); });
    }
}
