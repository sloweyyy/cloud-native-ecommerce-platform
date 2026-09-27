using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Application.Responses;
using Basket.Core.Entities;
using Basket.Core.Repositories;
using Common.Mediator;

namespace Basket.Application.Handlers;

public class GetBasketByUserNameHandler : IRequestHandler<GetBasketByUserNameQuery, ShoppingCartResponse>
{
    private readonly IBasketRepository _basketRepository;

    public GetBasketByUserNameHandler(IBasketRepository basketRepository)
    {
        _basketRepository = basketRepository;
    }

    public async Task<ShoppingCartResponse> Handle(GetBasketByUserNameQuery request,
        CancellationToken cancellationToken)
    {
        // A user without a stored basket (e.g. first visit) simply has an empty one.
        var shoppingCart = await _basketRepository.GetBasket(request.UserName)
                           ?? new ShoppingCart(request.UserName);
        return BasketMapper.Instance.ToShoppingCartResponse(shoppingCart);
    }
}