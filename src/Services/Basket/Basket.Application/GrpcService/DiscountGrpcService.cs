using Discount.Grpc.Protos;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Basket.Application.GrpcService;

public class DiscountGrpcService : IDiscountService
{
    private readonly DiscountProtoService.DiscountProtoServiceClient _discountProtoServiceClient;
    private readonly DiscountGrpcOptions _options;
    private readonly ILogger<DiscountGrpcService> _logger;

    public DiscountGrpcService(
        DiscountProtoService.DiscountProtoServiceClient discountProtoServiceClient,
        IOptions<DiscountGrpcOptions> options,
        ILogger<DiscountGrpcService> logger)
    {
        _discountProtoServiceClient = discountProtoServiceClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<CouponModel> GetDiscount(string productName, CancellationToken cancellationToken = default)
    {
        try
        {
            var discountRequest = new GetDiscountRequest { ProductName = productName };
            // gRPC deadlines must be UTC. Without one a hung Discount service hangs CreateBasket.
            var deadline = DateTime.UtcNow.AddSeconds(_options.DiscountDeadlineSeconds);
            return await _discountProtoServiceClient.GetDiscountAsync(discountRequest,
                deadline: deadline, cancellationToken: cancellationToken);
        }
        catch (RpcException ex) when (ex.StatusCode is StatusCode.Unavailable or StatusCode.DeadlineExceeded)
        {
            // Graceful degradation: return no discount when service is unavailable or too slow
            _logger.LogWarning("Discount service {StatusCode} for product {ProductName}. Continuing without discount.",
                ex.StatusCode, productName);
            return NoDiscount(productName);
        }
        catch (RpcException ex)
        {
            _logger.LogError(ex, "gRPC error getting discount for product {ProductName}", productName);
            return NoDiscount(productName);
        }
    }

    private static CouponModel NoDiscount(string productName) => new()
    {
        ProductName = productName,
        Description = "No discount available",
        Amount = 0
    };
}
