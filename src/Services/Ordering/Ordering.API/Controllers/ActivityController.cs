using Common.Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.Queries;
using Ordering.Application.Responses;
using System.Net;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ActivityController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ILogger<ActivityController> _logger;
    
    public ActivityController(
        IMediator mediator,
        ILogger<ActivityController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }
    
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ActivityResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<PagedResult<ActivityResponse>>> GetRecentActivities(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? activityType = null,
        [FromQuery] string? entityType = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? actor = null)
    {
        var query = new GetRecentActivitiesQuery(
            pageIndex, 
            pageSize, 
            activityType, 
            entityType, 
            from, 
            to, 
            actor);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

