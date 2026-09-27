using Discount.Grpc.Protos;
using Grpc.Core;
using Microsoft.Extensions.Logging;

namespace Basket.Application.GrpcService;

public class DiscountGrpcService
{
    private readonly DiscountProtoService.DiscountProtoServiceClient _discountProtoServiceClient;
    private readonly ILogger<DiscountGrpcService> _logger;

    public DiscountGrpcService(
        DiscountProtoService.DiscountProtoServiceClient discountProtoServiceClient,
        ILogger<DiscountGrpcService> logger)
    {
        _discountProtoServiceClient = discountProtoServiceClient;
        _logger = logger;
    }

    public async Task<CouponModel> GetDiscount(string productName)
    {
        try
        {
            var discountRequest = new GetDiscountRequest { ProductName = productName };
            return await _discountProtoServiceClient.GetDiscountAsync(discountRequest);
        }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.Unavailable)
        {
            // Graceful degradation: return no discount when service is unavailable
            _logger.LogWarning("Discount service unavailable for product {ProductName}. Continuing without discount.", productName);
            return new CouponModel
            {
                ProductName = productName,
                Description = "No discount available",
                Amount = 0
            };
        }
        catch (RpcException ex)
        {
            _logger.LogError(ex, "gRPC error getting discount for product {ProductName}", productName);
            return new CouponModel
            {
                ProductName = productName,
                Description = "No discount available",
                Amount = 0
            };
        }
    }
}