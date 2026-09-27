using Basket.Application.Responses;
using Basket.Core.Entities;
using EventBus.Messages.Common;
using EventBus.Messages.Events;
using Riok.Mapperly.Abstractions;

namespace Basket.Application.Mappers;

[Mapper]
public partial class BasketMapper
{
    public static readonly BasketMapper Instance = new();

    public partial ShoppingCartResponse ToShoppingCartResponse(ShoppingCart cart);
    public partial ShoppingCartItemResponse ToShoppingCartItemResponse(ShoppingCartItem item);
    public partial BasketCheckoutEvent ToBasketCheckoutEvent(BasketCheckout basket);
    public partial BasketCheckoutEventV2 ToBasketCheckoutEventV2(BasketCheckoutV2 basket);
}
