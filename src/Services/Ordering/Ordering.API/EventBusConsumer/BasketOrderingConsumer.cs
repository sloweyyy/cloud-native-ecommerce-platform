using Ordering.Application.Mappers;
using EventBus.Messages.Common;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Commands;
using Ordering.Core.Repositories;
using Ordering.Infrastructure.Data;


namespace Ordering.API.EventBusConsumer;

public class BasketOrderingConsumer : IConsumer<BasketCheckoutEvent>
{
    private readonly IMediator _mediator;
    private readonly OrderMapper _mapper;
    private readonly ILogger<BasketOrderingConsumer> _logger;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IOrderRepository _orderRepository;

    public BasketOrderingConsumer(
        IMediator mediator, 
        OrderMapper mapper, 
        ILogger<BasketOrderingConsumer> logger,
        IPublishEndpoint publishEndpoint,
        IOrderRepository orderRepository)
    {
        _mediator = mediator;
        _mapper = mapper;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
        _orderRepository = orderRepository;
    }

    public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
    {
        using var scope = _logger.BeginScope("Consuming Basket Checkout Event for {correlationId}",
            context.Message.CorrelationId);

        _logger.LogInformation("Basket Checkout Event Consumed: {Event}", context.Message);

        // Idempotency: a redelivered (or re-published) checkout must not create a second order.
        // The unique index on Orders.CorrelationId backs this check against concurrent deliveries.
        if (await _orderRepository.ExistsByCorrelationIdAsync(context.Message.CorrelationId))
        {
            _logger.LogWarning("Duplicate Basket Checkout Event skipped. CorrelationId: {CorrelationId}",
                context.Message.CorrelationId);
            return;
        }

        var cmd = _mapper.ToCheckoutOrderCommand(context.Message);
        int result;
        try
        {
            result = await _mediator.Send(cmd);
        }
        catch (DbUpdateException ex) when (ex.IsUniqueConstraintViolation())
        {
            _logger.LogWarning("Duplicate Basket Checkout Event skipped (concurrent delivery). CorrelationId: {CorrelationId}",
                context.Message.CorrelationId);
            return;
        }
        
        // Publish OrderActivityEvent after successful order creation
        if (result > 0)
        {
            var eventMessage = new OrderActivityEvent
            {
                ActivityType = OrderActivityType.Created,
                OrderId = result,
                Actor = context.Message.UserName,
                TotalPrice = context.Message.TotalPrice,
                OccurredAt = DateTime.UtcNow
            };
            
            await _publishEndpoint.Publish(eventMessage);
            _logger.LogInformation("OrderActivityEvent published for OrderId: {OrderId}", result);
        }
        
        _logger.LogInformation("Basket Checkout Event completed!!!");
    }
}