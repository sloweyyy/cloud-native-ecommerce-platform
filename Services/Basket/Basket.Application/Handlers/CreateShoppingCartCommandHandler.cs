using Basket.Application.Commands;
using Basket.Application.Mappers;
using Basket.Application.Responses;
using Basket.Core.Repositories;
using Basket.Core.Entities;
using MediatR;
using Basket.Application.GrpcService;
using Microsoft.Extensions.Configuration;

namespace Basket.Application.Handlers;

public class CreateShoppingCartCommandHandler : IRequestHandler<CreateShoppingCartCommand, ShoppingCartResponse>
{
    private readonly IBasketRepository _basketRepository;
    private readonly DiscountGrpcService _discountGrpcService;
    private readonly IConfiguration _configuration;

    public CreateShoppingCartCommandHandler(IBasketRepository basketRepository, DiscountGrpcService discountGrpcService, IConfiguration configuration)
    {
        _basketRepository = basketRepository;
        _discountGrpcService = discountGrpcService;
        _configuration = configuration;
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
            }
        }

        var shoppingCart = await _basketRepository.UpdateBasket(new ShoppingCart
        {
            UserName = request.UserName,
            Items = request.Items
        });
        var shoppingCartResponse = BasketMapper.Mapper.Map<ShoppingCartResponse>(shoppingCart);
        return shoppingCartResponse;
    }
}