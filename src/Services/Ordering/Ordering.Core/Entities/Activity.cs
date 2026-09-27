using Ordering.Core.Common;

namespace Ordering.Core.Entities;

public class Activity : EntityBase
{
    public Guid EventId { get; set; } // Unique event ID for idempotency
    public string ActivityType { get; set; } = string.Empty; // 'Product.Created', 'Product.Updated', 'Order.Created', 'Order.Updated'
    public string EntityType { get; set; } = string.Empty; // 'Product', 'Order'
    public string EntityId { get; set; } = string.Empty; // Product ID hoặc Order ID
    public string Title { get; set; } = string.Empty; // 'Product Created', 'New Order'
    public string? Description { get; set; } // 'Wireless Headphones', 'Order #12345 received'
    public string? Actor { get; set; } // User/system thực hiện action
    public string SourceService { get; set; } = string.Empty; // 'Catalog', 'Ordering'
    public string? Metadata { get; set; } // JSON metadata (optional)
    public DateTime OccurredAt { get; set; } // Thời điểm event xảy ra
}

