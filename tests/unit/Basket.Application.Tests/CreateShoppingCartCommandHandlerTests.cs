using Basket.Application.Commands;
using Basket.Application.GrpcService;
using Basket.Application.Handlers;
using Basket.Core.Entities;
using Basket.Core.Repositories;
using Discount.Grpc.Protos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace Basket.Application.Tests;

public class CreateShoppingCartCommandHandlerTests
{
    private readonly IBasketRepository _repository = Substitute.For<IBasketRepository>();
    private readonly IDiscountService _discountService = Substitute.For<IDiscountService>();

    public CreateShoppingCartCommandHandlerTests()
    {
        // The repository echoes what was stored.
        _repository.UpdateBasket(Arg.Any<ShoppingCart>()).Returns(call => call.Arg<ShoppingCart>());
    }

    private CreateShoppingCartCommandHandler CreateHandler(bool bypassDiscount = false)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BypassDiscount:Enabled"] = bypassDiscount.ToString(),
            })
            .Build();
        return new CreateShoppingCartCommandHandler(_repository, _discountService, configuration,
            NullLogger<CreateShoppingCartCommandHandler>.Instance);
    }

    private void CouponFor(string productName, int amount) =>
        _discountService.GetDiscount(productName, Arg.Any<CancellationToken>())
            .Returns(new CouponModel { ProductName = productName, Amount = amount });

    private static ShoppingCartItem Item(string name, decimal price, int quantity = 1) =>
        new() { ProductName = name, Price = price, Quantity = quantity };

    [Fact]
    public async Task Applies_coupon_amount_to_new_items()
    {
        CouponFor("Laptop", 500);
        var command = new CreateShoppingCartCommand("alice", new List<ShoppingCartItem> { Item("Laptop", 1500m, 2) });

        var response = await CreateHandler().Handle(command, CancellationToken.None);

        var item = response.Items.ShouldHaveSingleItem();
        item.OriginalPrice.ShouldBe(1500m);
        item.DiscountAmount.ShouldBe(500m);
        item.Price.ShouldBe(1000m);
        response.TotalPrice.ShouldBe(2000m);
    }

    [Fact]
    public async Task Coupon_larger_than_price_is_clamped_to_a_free_item()
    {
        CouponFor("Cable", 50);
        var command = new CreateShoppingCartCommand("alice", new List<ShoppingCartItem> { Item("Cable", 20m) });

        var response = await CreateHandler().Handle(command, CancellationToken.None);

        var item = response.Items.ShouldHaveSingleItem();
        item.DiscountAmount.ShouldBe(20m);
        item.Price.ShouldBe(0m);
        response.TotalPrice.ShouldBe(0m);
    }

    [Fact]
    public async Task Zero_amount_coupon_from_degraded_discount_service_keeps_price()
    {
        // DiscountGrpcService returns a zero coupon when Discount fails (see DiscountGrpcServiceTests).
        CouponFor("Laptop", 0);
        var command = new CreateShoppingCartCommand("alice", new List<ShoppingCartItem> { Item("Laptop", 1500m) });

        var response = await CreateHandler().Handle(command, CancellationToken.None);

        response.Items.ShouldHaveSingleItem().Price.ShouldBe(1500m);
    }

    [Fact]
    public async Task Already_discounted_items_are_not_discounted_again()
    {
        var command = new CreateShoppingCartCommand("alice", new List<ShoppingCartItem>
        {
            new() { ProductName = "Laptop", OriginalPrice = 1500m, Price = 1000m, DiscountAmount = 500m, Quantity = 1 },
        });

        var response = await CreateHandler().Handle(command, CancellationToken.None);

        response.Items.ShouldHaveSingleItem().Price.ShouldBe(1000m);
        await _discountService.DidNotReceiveWithAnyArgs().GetDiscount(default!, default);
    }

    [Fact]
    public async Task Bypass_flag_skips_the_discount_service()
    {
        var command = new CreateShoppingCartCommand("alice", new List<ShoppingCartItem> { Item("Laptop", 1500m) });

        var response = await CreateHandler(bypassDiscount: true).Handle(command, CancellationToken.None);

        response.Items.ShouldHaveSingleItem().Price.ShouldBe(1500m);
        await _discountService.DidNotReceiveWithAnyArgs().GetDiscount(default!, default);
    }

    [Fact]
    public async Task Null_items_are_stored_as_an_empty_basket()
    {
        var command = new CreateShoppingCartCommand("alice", null!);

        var response = await CreateHandler().Handle(command, CancellationToken.None);

        response.Items.ShouldBeEmpty();
        await _repository.Received(1).UpdateBasket(Arg.Is<ShoppingCart>(c => c.UserName == "alice" && c.Items.Count == 0));
    }
}
