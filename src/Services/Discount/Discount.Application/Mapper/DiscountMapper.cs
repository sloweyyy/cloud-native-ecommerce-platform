using Discount.Application.Commands;
using Discount.Core.Entities;
using Discount.Grpc.Protos;
using Riok.Mapperly.Abstractions;

namespace Discount.Application.Mapper;

[Mapper]
public partial class DiscountMapper
{
    public partial Coupon ToCoupon(CouponModel model);
    public partial CouponModel ToCouponModel(Coupon coupon);

    // Id is database-generated on insert.
    [MapperIgnoreTarget(nameof(Coupon.Id))]
    public partial Coupon ToCoupon(CreateDiscountCommand command);

    public partial Coupon ToCoupon(UpdateDiscountCommand command);
}
