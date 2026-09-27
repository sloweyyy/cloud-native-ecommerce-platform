using EventBus.Messages.Events;
using MassTransit;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.API.EventBusConsumer;

public class ProductActivityConsumer : IConsumer<ProductActivityEvent>
{
    private readonly IActivityRepository _activityRepository;
    private readonly ILogger<ProductActivityConsumer> _logger;
    
    public ProductActivityConsumer(
        IActivityRepository activityRepository,
        ILogger<ProductActivityConsumer> logger)
    {
        _activityRepository = activityRepository;
        _logger = logger;
    }
    
    public async Task Consume(ConsumeContext<ProductActivityEvent> context)
    {
        // Idempotency check: Tránh duplicate khi event bị consume lại
        if (await _activityRepository.ExistsByEventIdAsync(context.Message.EventId))
        {
            _logger.LogWarning(
                "Duplicate event detected and skipped. EventId: {EventId}, ProductId: {ProductId}",
                context.Message.EventId,
                context.Message.ProductId);
            return;
        }
        
        var activity = new Activity
        {
            EventId = context.Message.EventId,
            ActivityType = $"Product.{context.Message.ActivityType}",
            EntityType = "Product",
            EntityId = context.Message.ProductId,
            Title = $"Product {context.Message.ActivityType}",
            Description = context.Message.ProductName,
            Actor = context.Message.Actor,
            SourceService = "Catalog",
            OccurredAt = context.Message.OccurredAt,
            CreatedDate = DateTime.UtcNow
        };
        
        await _activityRepository.AddAsync(activity);
        _logger.LogInformation(
            "Product activity consumed and saved. EventId: {EventId}, Type: {ActivityType}, ProductId: {ProductId}",
            context.Message.EventId,
            activity.ActivityType,
            context.Message.ProductId);
    }
}

