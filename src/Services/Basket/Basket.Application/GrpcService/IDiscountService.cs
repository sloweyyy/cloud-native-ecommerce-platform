using Discount.Grpc.Protos;

namespace Basket.Application.GrpcService;

public interface IDiscountService
{
    /// <summary>
    /// Gets the discount for a product. Never throws for Discount-side failures: returns a
    /// zero-amount coupon so a slow or unavailable Discount service can't block the basket.
    /// </summary>
    Task<CouponModel> GetDiscount(string productName, CancellationToken cancellationToken = default);
}
