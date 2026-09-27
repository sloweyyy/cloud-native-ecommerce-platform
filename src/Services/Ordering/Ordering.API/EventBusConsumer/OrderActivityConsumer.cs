using EventBus.Messages.Events;
using MassTransit;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.API.EventBusConsumer;

public class OrderActivityConsumer : IConsumer<OrderActivityEvent>
{
    private readonly IActivityRepository _activityRepository;
    private readonly ILogger<OrderActivityConsumer> _logger;
    
    public OrderActivityConsumer(
        IActivityRepository activityRepository,
        ILogger<OrderActivityConsumer> logger)
    {
        _activityRepository = activityRepository;
        _logger = logger;
    }
    
    public async Task Consume(ConsumeContext<OrderActivityEvent> context)
    {
        // Idempotency check: Tránh duplicate khi event bị consume lại
        if (await _activityRepository.ExistsByEventIdAsync(context.Message.EventId))
        {
            _logger.LogWarning(
                "Duplicate event detected and skipped. EventId: {EventId}, OrderId: {OrderId}",
                context.Message.EventId,
                context.Message.OrderId);
            return;
        }
        
        var activity = new Activity
        {
            EventId = context.Message.EventId,
            ActivityType = $"Order.{context.Message.ActivityType}",
            EntityType = "Order",
            EntityId = context.Message.OrderId.ToString(),
            Title = $"Order {context.Message.ActivityType}",
            Description = context.Message.ActivityType == OrderActivityType.Created 
                ? $"Order #{context.Message.OrderId} received" 
                : $"Order #{context.Message.OrderId} {context.Message.ActivityType}",
            Actor = context.Message.Actor,
            SourceService = "Ordering",
            OccurredAt = context.Message.OccurredAt,
            CreatedDate = DateTime.UtcNow
        };
        
        await _activityRepository.AddAsync(activity);
        _logger.LogInformation(
            "Order activity consumed and saved. EventId: {EventId}, Type: {ActivityType}, OrderId: {OrderId}",
            context.Message.EventId,
            activity.ActivityType,
            context.Message.OrderId);
    }
}

