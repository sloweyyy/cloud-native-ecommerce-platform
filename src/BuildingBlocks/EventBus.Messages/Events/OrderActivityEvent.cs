using EventBus.Messages.Common;

namespace EventBus.Messages.Events;

/// <summary>
/// Event published when an order activity occurs (created, updated, cancelled)
/// </summary>
public class OrderActivityEvent : BaseIntegrationEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid(); // Unique ID for idempotency
    public OrderActivityType ActivityType { get; set; }
    public int OrderId { get; set; }
    public string? Actor { get; set; } // User thực hiện action
    public decimal? TotalPrice { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object>? Metadata { get; set; } // Additional context
}

/// <summary>
/// Enum for order activity types
/// </summary>
public enum OrderActivityType
{
    Created,
    Updated,
    Cancelled
}

