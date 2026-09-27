using Common.Mediator;

namespace Ordering.Application.Commands;

public class CheckoutOrderCommandV2 : IRequest<int>
{
    public string? UserName { get; set; }
    public decimal? TotalPrice { get; set; }

    /// <summary>Idempotency key: the originating integration event's CorrelationId.</summary>
    public string? CorrelationId { get; set; }
}