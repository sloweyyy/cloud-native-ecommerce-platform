using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.Commands;
using Ordering.Application.Queries;
using Ordering.Application.Responses;
using System.Net;

namespace Ordering.API.Controllers;

public class OrderController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrderController> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderController(
        IMediator mediator, 
        ILogger<OrderController> logger,
        IPublishEndpoint publishEndpoint)
    {
        _mediator = mediator;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
    }

    [HttpGet("{userName}", Name = "GetOrdersByUserName")]
    [ProducesResponseType(typeof(IEnumerable<OrderResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrdersByUserName(string userName)
    {
        var query = new GetOrderListQuery(userName);
        var orders = await _mediator.Send(query);
        return Ok(orders);
    }

    //Just for testing 
    [HttpPost(Name = "CheckoutOrder")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<ActionResult<int>> CheckoutOrder([FromBody] CheckoutOrderCommand command)
    {
        var result = await _mediator.Send(command);
        
        // Publish OrderActivityEvent after successful order creation
        if (result > 0)
        {
            var eventMessage = new OrderActivityEvent
            {
                ActivityType = OrderActivityType.Created,
                OrderId = result,
                Actor = command.UserName,
                TotalPrice = command.TotalPrice,
                OccurredAt = DateTime.UtcNow
            };
            
            await _publishEndpoint.Publish(eventMessage);
            _logger.LogInformation("OrderActivityEvent published for OrderId: {OrderId}", result);
        }
        
        return Ok(result);
    }

    [HttpPut(Name = "UpdateOrder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<int>> UpdateOrder([FromBody] UpdateOrderCommand command)
    {
        var result = await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}", Name = "DeleteOrder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteOrder(int id)
    {
        var cmd = new DeleteOrderCommand() { Id = id };
        await _mediator.Send(cmd);
        return NoContent();
    }
}