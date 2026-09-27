using Ordering.Application.Mappers;

using Common.Mediator;
using Ordering.Application.Queries;
using Ordering.Application.Responses;
using Ordering.Core.Repositories;
using CorePagedResult = Ordering.Core.Repositories.PagedResult<Ordering.Core.Entities.Activity>;
using AppPagedResult = Ordering.Application.Responses.PagedResult<Ordering.Application.Responses.ActivityResponse>;

namespace Ordering.Application.Handlers;

public class GetRecentActivitiesQueryHandler 
    : IRequestHandler<GetRecentActivitiesQuery, AppPagedResult>
{
    private readonly IActivityRepository _activityRepository;
    private readonly OrderMapper _mapper;
    
    public GetRecentActivitiesQueryHandler(
        IActivityRepository activityRepository,
        OrderMapper mapper)
    {
        _activityRepository = activityRepository;
        _mapper = mapper;
    }
    
    public async Task<AppPagedResult> Handle(
        GetRecentActivitiesQuery request, 
        CancellationToken cancellationToken)
    {
        var corePagedResult = await _activityRepository.GetActivitiesAsync(
            pageIndex: request.PageIndex,
            pageSize: request.PageSize,
            activityType: request.ActivityType,
            entityType: request.EntityType,
            from: request.From,
            to: request.To,
            actor: request.Actor);
            
        return new AppPagedResult
        {
            Items = _mapper.ToActivityResponseList(corePagedResult.Items),
            TotalCount = corePagedResult.TotalCount,
            PageIndex = corePagedResult.PageIndex,
            PageSize = corePagedResult.PageSize
        };
    }
}

