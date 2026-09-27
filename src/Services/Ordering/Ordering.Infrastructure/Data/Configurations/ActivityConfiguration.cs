using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Core.Entities;

namespace Ordering.Infrastructure.Data.Configurations;

/// <summary>
/// Mirrors the Activities schema that older deployments created through the
/// seeder's raw-SQL fallback, so the AddActivitiesTable migration produces the
/// same table on fresh databases and can be skipped on legacy ones.
/// </summary>
public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities");

        builder.Property(a => a.ActivityType).HasMaxLength(50).IsRequired();
        builder.Property(a => a.EntityType).HasMaxLength(50).IsRequired();
        builder.Property(a => a.EntityId).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Title).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Description).HasMaxLength(500);
        builder.Property(a => a.Actor).HasMaxLength(100);
        builder.Property(a => a.SourceService).HasMaxLength(50).IsRequired();

        // EventId is the idempotency key for activity consumers.
        builder.HasAlternateKey(a => a.EventId).HasName("UX_Activities_EventId");

        builder.HasIndex(a => a.CreatedDate).HasDatabaseName("IX_Activities_CreatedDate");
        builder.HasIndex(a => a.OccurredAt).HasDatabaseName("IX_Activities_OccurredAt");
        builder.HasIndex(a => a.ActivityType).HasDatabaseName("IX_Activities_ActivityType");
        builder.HasIndex(a => a.EntityType).HasDatabaseName("IX_Activities_EntityType");
    }
}
