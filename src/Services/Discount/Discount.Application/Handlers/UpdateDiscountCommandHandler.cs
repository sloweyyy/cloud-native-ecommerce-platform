using Discount.Application.Commands;
using Discount.Application.Mapper;
using Discount.Core.Repositories;
using Discount.Grpc.Protos;
using Common.Mediator;

namespace Discount.Application.Handlers;

public class UpdateDiscountCommandHandler : IRequestHandler<UpdateDiscountCommand, CouponModel>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly DiscountMapper _mapper;

    public UpdateDiscountCommandHandler(IDiscountRepository discountRepository, DiscountMapper mapper)
    {
        _discountRepository = discountRepository;
        _mapper = mapper;
    }

    public async Task<CouponModel> Handle(UpdateDiscountCommand request, CancellationToken cancellationToken)
    {
        var coupon = _mapper.ToCoupon(request);
        await _discountRepository.UpdateDiscount(coupon);
        return _mapper.ToCouponModel(coupon);
    }
}
