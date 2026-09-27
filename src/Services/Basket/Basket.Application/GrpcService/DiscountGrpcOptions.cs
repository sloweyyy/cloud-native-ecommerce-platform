namespace Basket.Application.GrpcService;

/// <summary>Bound from the <c>GrpcSettings</c> configuration section.</summary>
public class DiscountGrpcOptions
{
    public const string SectionName = "GrpcSettings";

    /// <summary>Deadline for a single GetDiscount call, in seconds.</summary>
    public double DiscountDeadlineSeconds { get; set; } = 3;
}
