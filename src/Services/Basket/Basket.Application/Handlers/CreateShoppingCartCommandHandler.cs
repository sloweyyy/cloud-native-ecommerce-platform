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
    private readonly DiscountGrpcService _discountGrpcService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CreateShoppingCartCommandHandler> _logger;

    public CreateShoppingCartCommandHandler(IBasketRepository basketRepository, DiscountGrpcService discountGrpcService, IConfiguration configuration, ILogger<CreateShoppingCartCommandHandler> logger)
    {
        _basketRepository = basketRepository;
        _discountGrpcService = discountGrpcService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ShoppingCartResponse> Handle(CreateShoppingCartCommand request,
    CancellationToken cancellationToken)
    {
        var bypassDiscount = _configuration.GetValue<bool>("BypassDiscount:Enabled");

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
                var coupon = await _discountGrpcService.GetDiscount(item.ProductName);
                item.DiscountAmount = coupon.Amount;

                // Update the Price to reflect the discounted price
                item.Price = item.OriginalPrice - item.DiscountAmount;
                _logger.LogInformation($"Discount of {coupon.Amount} applied to {item.ProductName}. New Price: {item.Price}");
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