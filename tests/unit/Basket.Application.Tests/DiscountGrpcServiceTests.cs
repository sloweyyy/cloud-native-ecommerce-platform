using Basket.Application.GrpcService;
using Discount.Grpc.Protos;
using Grpc.Core;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Basket.Application.Tests;

public class DiscountGrpcServiceTests
{
    // Generated client methods are virtual, so the real DiscountGrpcService catch paths run.
    private readonly DiscountProtoService.DiscountProtoServiceClient _client =
        Substitute.For<DiscountProtoService.DiscountProtoServiceClient>();

    private DiscountGrpcService CreateService(double deadlineSeconds = 3) => new(
        _client,
        Options.Create(new DiscountGrpcOptions { DiscountDeadlineSeconds = deadlineSeconds }),
        NullLogger<DiscountGrpcService>.Instance);

    private static AsyncUnaryCall<CouponModel> Call(Task<CouponModel> response) =>
        new(response, Task.FromResult(new Metadata()), () => Status.DefaultSuccess, () => new Metadata(), () => { });

    private void Returns(Task<CouponModel> response) =>
        _client.GetDiscountAsync(Arg.Any<GetDiscountRequest>(), Arg.Any<Metadata?>(), Arg.Any<DateTime?>(),
                Arg.Any<CancellationToken>())
            .Returns(_ => Call(response));

    [Fact]
    public async Task Returns_coupon_from_discount_service()
    {
        Returns(Task.FromResult(new CouponModel { ProductName = "Laptop", Amount = 500 }));

        var coupon = await CreateService().GetDiscount("Laptop");

        coupon.Amount.ShouldBe(500);
        _client.Received(1).GetDiscountAsync(Arg.Is<GetDiscountRequest>(r => r.ProductName == "Laptop"),
            Arg.Any<Metadata?>(), Arg.Any<DateTime?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Every_call_carries_a_utc_deadline_from_options()
    {
        Returns(Task.FromResult(new CouponModel()));
        DateTime? deadline = null;
        _client.When(c => c.GetDiscountAsync(Arg.Any<GetDiscountRequest>(), Arg.Any<Metadata?>(),
                Arg.Any<DateTime?>(), Arg.Any<CancellationToken>()))
            .Do(call => deadline = call.ArgAt<DateTime?>(2));

        var before = DateTime.UtcNow;
        await CreateService(deadlineSeconds: 4).GetDiscount("Laptop");

        deadline.ShouldNotBeNull();
        deadline.Value.Kind.ShouldBe(DateTimeKind.Utc);
        deadline.Value.ShouldBeInRange(before.AddSeconds(4), DateTime.UtcNow.AddSeconds(4));
    }

    [Fact]
    public async Task Forwards_the_cancellation_token()
    {
        Returns(Task.FromResult(new CouponModel()));
        using var cts = new CancellationTokenSource();

        await CreateService().GetDiscount("Laptop", cts.Token);

        _client.Received(1).GetDiscountAsync(Arg.Any<GetDiscountRequest>(), Arg.Any<Metadata?>(),
            Arg.Any<DateTime?>(), cts.Token);
    }

    [Theory]
    [InlineData(StatusCode.Unavailable)]
    [InlineData(StatusCode.DeadlineExceeded)]
    [InlineData(StatusCode.NotFound)]
    [InlineData(StatusCode.Internal)]
    public async Task Rpc_failures_degrade_to_a_zero_discount(StatusCode statusCode)
    {
        Returns(Task.FromException<CouponModel>(new RpcException(new Status(statusCode, "boom"))));

        var coupon = await CreateService().GetDiscount("Laptop");

        coupon.ProductName.ShouldBe("Laptop");
        coupon.Amount.ShouldBe(0);
    }
}
