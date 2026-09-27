using Ordering.Application.Mappers;
using EventBus.Messages.Common;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Ordering.Application.Commands;


namespace Ordering.API.EventBusConsumer;

public class BasketOrderingConsumer : IConsumer<BasketCheckoutEvent>
{
    private readonly IMediator _mediator;
    private readonly OrderMapper _mapper;
    private readonly ILogger<BasketOrderingConsumer> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    public BasketOrderingConsumer(
        IMediator mediator, 
        OrderMapper mapper, 
        ILogger<BasketOrderingConsumer> logger,
        IPublishEndpoint publishEndpoint)
    {
        _mediator = mediator;
        _mapper = mapper;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
    {
        using var scope = _logger.BeginScope("Consuming Basket Checkout Event for {correlationId}",
            context.Message.CorrelationId);

        _logger.LogInformation("Basket Checkout Event Consumed: {Event}", context.Message);
        var cmd = _mapper.ToCheckoutOrderCommand(context.Message);
        var result = await _mediator.Send(cmd);
        
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