using Basket.Application.Responses;
using Common.Mediator;

namespace Basket.Application.Queries;

public class GetBasketByUserNameQuery : IRequest<ShoppingCartResponse>
{
    public string UserName { get; set; }

    public GetBasketByUserNameQuery(string userName)
    {
        UserName = userName;
    }
}