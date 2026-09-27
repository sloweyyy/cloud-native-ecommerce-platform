using Basket.Application.Commands;
using Basket.Application.Mappers;
using Basket.Application.Responses;
using Basket.Core.Repositories;
using Basket.Core.Entities;
using Common.Mediator;
using Basket.Application.GrpcService;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Basket.Application.Handlers;

public class CreateShoppingCartCommandHandler : IRequestHandler<CreateShoppingCartCommand, ShoppingCartResponse>
{
    private readonly IBasketRepository _basketRepository;
    private readonly IDiscountService _discountService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CreateShoppingCartCommandHandler> _logger;

    public CreateShoppingCartCommandHandler(IBasketRepository basketRepository, IDiscountService discountService, IConfiguration configuration, ILogger<CreateShoppingCartCommandHandler> logger)
    {
        _basketRepository = basketRepository;
        _discountService = discountService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ShoppingCartResponse> Handle(CreateShoppingCartCommand request,
    CancellationToken cancellationToken)
    {
        var bypassDiscount = _configuration.GetValue<bool>("BypassDiscount:Enabled");

        request.Items ??= new List<ShoppingCartItem>();

        foreach (var item in request.Items)
        {
            // If OriginalPrice is not set, use the current Price as the original price
            if (item.OriginalPrice <= 0)
            {
                item.OriginalPrice = item.Price;
            }

            // Apply discount only if it hasn't been applied yet and bypass is not enabled
            if (!bypassDiscount && item.DiscountAmount == 0 && item.Price == item.OriginalPrice)
            {
                var coupon = await _discountService.GetDiscount(item.ProductName, cancellationToken);
                // A coupon larger than the price must not produce a negative price.
                item.DiscountAmount = Math.Min(Math.Max(coupon.Amount, 0), Math.Max(item.OriginalPrice, 0));

                // Update the Price to reflect the discounted price
                item.Price = item.OriginalPrice - item.DiscountAmount;
                _logger.LogInformation("Discount of {DiscountAmount} applied to {ProductName}. New Price: {Price}",
                    item.DiscountAmount, item.ProductName, item.Price);
            }
        }

        var shoppingCart = await _basketRepository.UpdateBasket(new ShoppingCart
        {
            UserName = request.UserName,
            Items = request.Items
        });
        return BasketMapper.Instance.ToShoppingCartResponse(shoppingCart);
    }
}