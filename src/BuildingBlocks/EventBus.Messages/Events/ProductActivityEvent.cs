using EventBus.Messages.Common;

namespace EventBus.Messages.Events;

/// <summary>
/// Event published when a product activity occurs (created, updated, deleted)
/// </summary>
public class ProductActivityEvent : BaseIntegrationEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid(); // Unique ID for idempotency
    public ProductActivityType ActivityType { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Actor { get; set; } // User thực hiện action (nullable vì có thể là system)
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object>? Metadata { get; set; } // Additional context
}

/// <summary>
/// Enum for product activity types
/// </summary>
public enum ProductActivityType
{
    Created,
    Updated,
    Deleted
}

