using Asp.Versioning;
using Basket.Application.Commands;
using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Core.Entities;
using EventBus.Messages.Common;
using FluentValidation;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Basket.API.Controllers.V2;

[ApiVersion("2")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public class BasketController : ControllerBase
{
    public readonly IMediator _mediator;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<BasketController> _logger;
    private readonly IValidator<BasketCheckoutV2> _checkoutValidator;

    public BasketController(IMediator mediator, IPublishEndpoint publishEndpoint, ILogger<BasketController> logger,
        IValidator<BasketCheckoutV2> checkoutValidator)
    {
        _mediator = mediator;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
        _checkoutValidator = checkoutValidator;
    }

    [Route("[action]")]
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.Accepted)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> Checkout([FromBody] BasketCheckoutV2 basketCheckout)
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

        var eventMsg = BasketMapper.Instance.ToBasketCheckoutEventV2(basketCheckout);
        eventMsg.TotalPrice = basket.TotalPrice;
        await _publishEndpoint.Publish(eventMsg);
        _logger.LogInformation($"Basket Published for {basket.UserName} with V2 endpoint");
        //remove the basket
        var deleteCmd = new DeleteBasketByUserNameCommand(basketCheckout.UserName);
        await _mediator.Send(deleteCmd);
        return Accepted();
    }
}