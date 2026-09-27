namespace Ordering.Application.Responses;

public class ActivityResponse
{
    public int Id { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Actor { get; set; }
    public string SourceService { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public DateTime? CreatedDate { get; set; }
}

