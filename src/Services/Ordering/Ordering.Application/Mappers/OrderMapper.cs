using EventBus.Messages.Common;
using EventBus.Messages.Events;
using Ordering.Application.Commands;
using Ordering.Application.Responses;
using Ordering.Core.Entities;
using Riok.Mapperly.Abstractions;

namespace Ordering.Application.Mappers;

[Mapper]
public partial class OrderMapper
{
    public partial OrderResponse ToOrderResponse(Order order);
    public partial List<OrderResponse> ToOrderResponseList(IEnumerable<Order> orders);

    // Id is database-generated on insert.
    [MapperIgnoreTarget(nameof(Order.Id))]
    public partial Order ToOrder(CheckoutOrderCommand command);

    [MapperIgnoreTarget(nameof(Order.Id))]
    public partial Order ToOrder(CheckoutOrderCommandV2 command);

    // In-place update: copies fields from source onto target without allocating a new entity.
    public partial void UpdateOrder(UpdateOrderCommand source, Order target);

    public partial CheckoutOrderCommand ToCheckoutOrderCommand(BasketCheckoutEvent message);
    public partial CheckoutOrderCommandV2 ToCheckoutOrderCommandV2(BasketCheckoutEventV2 message);

    public partial ActivityResponse ToActivityResponse(Activity activity);
    public partial IReadOnlyList<ActivityResponse> ToActivityResponseList(IEnumerable<Activity> activities);
}
