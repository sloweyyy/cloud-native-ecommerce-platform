using Common.Mediator;
using Ordering.Application.Responses;

namespace Ordering.Application.Queries;

public record GetRecentActivitiesQuery(
    int PageIndex = 0,
    int PageSize = 10,
    string? ActivityType = null,
    string? EntityType = null,
    DateTime? From = null,
    DateTime? To = null,
    string? Actor = null
) : IRequest<Ordering.Application.Responses.PagedResult<ActivityResponse>>;

