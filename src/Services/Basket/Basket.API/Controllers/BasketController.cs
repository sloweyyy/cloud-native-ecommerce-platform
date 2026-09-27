using Common.Logging;
using Asp.Versioning;
using Basket.Application.Commands;
using Basket.Application.GrpcService;
using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Application.Responses;
using Basket.Core.Entities;
using EventBus.Messages.Common;
using FluentValidation;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Basket.API.Controllers;

[ApiVersion("1")]
public class BasketController : ApiController
{
    public readonly IMediator _mediator;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<BasketController> _logger;
    private readonly IValidator<BasketCheckout> _checkoutValidator;

    public BasketController(IMediator mediator, IPublishEndpoint publishEndpoint, ILogger<BasketController> logger,
        IValidator<BasketCheckout> checkoutValidator)
    {
        _mediator = mediator;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
        _checkoutValidator = checkoutValidator;
    }

    [HttpGet]
    [Route("[action]/{userName}", Name = "GetBasketByUserName")]
    [ProducesResponseType(typeof(ShoppingCartResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ShoppingCartResponse>> GetBasket(string userName)
    {
        var query = new GetBasketByUserNameQuery(userName);
        var basket = await _mediator.Send(query);
        return Ok(basket);
    }

    [HttpPost("CreateBasket")]
    [ProducesResponseType(typeof(ShoppingCartResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ShoppingCartResponse>> UpdateBasket(
        [FromBody] CreateShoppingCartCommand createShoppingCartCommand)
    {
        var basket = await _mediator.Send(createShoppingCartCommand);
        return Ok(basket);
    }

    [HttpDelete]
    [Route("[action]/{userName}", Name = "DeleteBasketByUserName")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<ActionResult> DeleteBasket(string userName)
    {
        var cmd = new DeleteBasketByUserNameCommand(userName);
        return Ok(await _mediator.Send(cmd));
    }

    [Route("[action]")]
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.Accepted)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> Checkout([FromBody] BasketCheckout basketCheckout)
    {
        // Validate before anything is published or deleted (ValidationException -> 400).
        await _checkoutValidator.ValidateAndThrowAsync(basketCheckout);

        //Get the existing basket with username
        var query = new GetBasketByUserNameQuery(basketCheckout.UserName);
        var basket = await _mediator.Send(query);
        // Missing and empty baskets look the same (GetBasket returns an empty basket):
        // either way there is nothing to check out.
        if (basket.Items.Count == 0)
            return Problem(statusCode: (int)HttpStatusCode.BadRequest, title: "Basket is empty",
                detail: $"No items in the basket for user '{basketCheckout.UserName}'.");

        // When a checkout happens in BasketController, it publishes an event using MassTransit:

        var eventMsg = BasketMapper.Instance.ToBasketCheckoutEvent(basketCheckout);
        eventMsg.TotalPrice = basket.TotalPrice;
        await _publishEndpoint.Publish(eventMsg);
        _logger.LogInformation("Basket Published for {UserName}", LogSanitizer.Sanitize(basket.UserName));
        //remove the basket
        var deleteCmd = new DeleteBasketByUserNameCommand(basketCheckout.UserName);
        await _mediator.Send(deleteCmd);
        return Accepted();
    }
}