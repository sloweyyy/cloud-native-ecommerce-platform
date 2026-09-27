using Ordering.Core.Entities;

namespace Ordering.Core.Repositories;

public interface IActivityRepository : IAsyncRepository<Activity>
{
    /// <summary>
    /// Check if activity with given EventId already exists (for idempotency)
    /// </summary>
    Task<bool> ExistsByEventIdAsync(Guid eventId);

    /// <summary>
    /// Get activities with pagination and filters
    /// </summary>
    Task<PagedResult<Activity>> GetActivitiesAsync(
        int pageIndex,
        int pageSize,
        string? activityType = null,
        string? entityType = null,
        DateTime? from = null,
        DateTime? to = null,
        string? actor = null);
}

/// <summary>
/// Generic paged result for pagination
/// </summary>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

