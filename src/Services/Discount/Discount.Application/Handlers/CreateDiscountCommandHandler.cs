using Discount.Application.Commands;
using Discount.Application.Mapper;
using Discount.Core.Repositories;
using Discount.Grpc.Protos;
using Common.Mediator;

namespace Discount.Application.Handlers;

public class CreateDiscountCommandHandler : IRequestHandler<CreateDiscountCommand, CouponModel>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly DiscountMapper _mapper;

    public CreateDiscountCommandHandler(IDiscountRepository discountRepository, DiscountMapper mapper)
    {
        _discountRepository = discountRepository;
        _mapper = mapper;
    }

    public async Task<CouponModel> Handle(CreateDiscountCommand request, CancellationToken cancellationToken)
    {
        var coupon = _mapper.ToCoupon(request);
        await _discountRepository.CreateDiscount(coupon);
        return _mapper.ToCouponModel(coupon);
    }
}
