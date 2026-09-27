using Ordering.Application.Mappers;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Commands;
using Ordering.Core.Repositories;
using Ordering.Infrastructure.Data;

namespace Ordering.API.EventBusConsumer;

public class BasketOrderingConsumerV2 : IConsumer<BasketCheckoutEventV2>
{
    private readonly IMediator _mediator;
    private readonly OrderMapper _mapper;
    private readonly ILogger<BasketOrderingConsumerV2> _logger;
    private readonly IOrderRepository _orderRepository;

    public BasketOrderingConsumerV2(IMediator mediator, OrderMapper mapper, ILogger<BasketOrderingConsumerV2> logger,
        IOrderRepository orderRepository)
    {
        _mediator = mediator;
        _mapper = mapper;
        _logger = logger;
        _orderRepository = orderRepository;
    }

    public async Task Consume(ConsumeContext<BasketCheckoutEventV2> context)
    {
        using var scope = _logger.BeginScope("Consuming Basket Checkout Event for {correlationId} with version 2",
            context.Message.CorrelationId);
        _logger.LogInformation("Basket Checkout Event Consumed: {Event}", context.Message);
        if (await _orderRepository.ExistsByCorrelationIdAsync(context.Message.CorrelationId))
        {
            _logger.LogWarning("Duplicate Basket Checkout Event (v2) skipped. CorrelationId: {CorrelationId}",
                context.Message.CorrelationId);
            return;
        }

        var cmd = _mapper.ToCheckoutOrderCommandV2(context.Message);
        try
        {
            await _mediator.Send(cmd);
        }
        catch (DbUpdateException ex) when (ex.IsUniqueConstraintViolation())
        {
            _logger.LogWarning("Duplicate Basket Checkout Event (v2) skipped (concurrent delivery). CorrelationId: {CorrelationId}",
                context.Message.CorrelationId);
            return;
        }
        _logger.LogInformation("Basket Checkout Event completed with version 2!!!");
    }
}