using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Core.Entities;

namespace Ordering.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.CorrelationId).HasMaxLength(100);

        // Idempotency guard for BasketCheckout consumers. Filtered (NULLs allowed many times)
        // so orders created through the HTTP API are unaffected.
        builder.HasIndex(o => o.CorrelationId)
            .IsUnique()
            .HasDatabaseName("UX_Orders_CorrelationId")
            .HasFilter("[CorrelationId] IS NOT NULL");
    }
}
