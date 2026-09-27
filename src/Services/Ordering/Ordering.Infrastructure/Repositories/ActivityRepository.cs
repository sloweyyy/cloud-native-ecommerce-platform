using Microsoft.EntityFrameworkCore;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;
using Ordering.Infrastructure.Data;

namespace Ordering.Infrastructure.Repositories;

public class ActivityRepository : RepositoryBase<Activity>, IActivityRepository
{
    public ActivityRepository(OrderContext dbContext) : base(dbContext)
    {
    }

    public async Task<bool> ExistsByEventIdAsync(Guid eventId)
    {
        return await _dbContext.Set<Activity>()
            .AnyAsync(a => a.EventId == eventId);
    }

    public async Task<PagedResult<Activity>> GetActivitiesAsync(
        int pageIndex,
        int pageSize,
        string? activityType = null,
        string? entityType = null,
        DateTime? from = null,
        DateTime? to = null,
        string? actor = null)
    {
        var query = _dbContext.Set<Activity>().AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(activityType))
        {
            query = query.Where(a => a.ActivityType == activityType);
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(a => a.EntityType == entityType);
        }

        if (from.HasValue)
        {
            query = query.Where(a => a.OccurredAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(a => a.OccurredAt <= to.Value);
        }

        if (!string.IsNullOrWhiteSpace(actor))
        {
            query = query.Where(a => a.Actor == actor);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply pagination and ordering
        var items = await query
            .OrderByDescending(a => a.OccurredAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Activity>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }
}

