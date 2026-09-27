using Basket.Application.Handlers;
using Basket.Application.Queries;
using Basket.Core.Entities;
using Basket.Core.Repositories;

namespace Basket.Application.Tests;

public class GetBasketByUserNameHandlerTests
{
    private readonly IBasketRepository _repository = Substitute.For<IBasketRepository>();

    [Fact]
    public async Task Unknown_user_gets_an_empty_basket()
    {
        _repository.GetBasket("new-user").Returns((ShoppingCart)null!);
        var handler = new GetBasketByUserNameHandler(_repository);

        var response = await handler.Handle(new GetBasketByUserNameQuery("new-user"), CancellationToken.None);

        response.ShouldNotBeNull();
        response.UserName.ShouldBe("new-user");
        response.Items.ShouldBeEmpty();
        response.TotalPrice.ShouldBe(0m);
    }

    [Fact]
    public async Task Existing_basket_is_mapped_with_total_price()
    {
        _repository.GetBasket("alice").Returns(new ShoppingCart("alice")
        {
            Items =
            {
                new ShoppingCartItem { ProductName = "A", Price = 10m, OriginalPrice = 10m, Quantity = 2 },
                new ShoppingCartItem { ProductName = "B", Price = 5.5m, OriginalPrice = 7m, DiscountAmount = 1.5m, Quantity = 1 },
            },
        });
        var handler = new GetBasketByUserNameHandler(_repository);

        var response = await handler.Handle(new GetBasketByUserNameQuery("alice"), CancellationToken.None);

        response.Items.Count.ShouldBe(2);
        response.TotalPrice.ShouldBe(25.5m);
    }
}
