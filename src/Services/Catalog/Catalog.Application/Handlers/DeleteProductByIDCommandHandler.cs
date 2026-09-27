using Catalog.Application.Commands;
using Catalog.Core.Repositories;
using Catalog.Core.Services;
using Common.Mediator;
using Microsoft.Extensions.Logging;

namespace Catalog.Application.Handlers;

public class DeleteProductByIDCommandHandler : IRequestHandler<DeleteProductByIdCommand, bool>
{
    private readonly IProductRepository _productRepository;
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<DeleteProductByIDCommandHandler> _logger;

    public DeleteProductByIDCommandHandler(
        IProductRepository productRepository,
        IImageStorageService imageStorageService,
        ILogger<DeleteProductByIDCommandHandler> logger)
    {
        _productRepository = productRepository;
        _imageStorageService = imageStorageService;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteProductByIdCommand request, CancellationToken cancellationToken)
    {
        // Get the product first to retrieve its image URL
        var product = await _productRepository.GetProduct(request.Id);

        if (product == null)
        {
            _logger.LogWarning("Product not found for deletion: Id={ProductId}", request.Id);
            return false;
        }

        // Delete the S3 image if it exists
        if (!string.IsNullOrWhiteSpace(product.ImageFile))
        {
            try
            {
                var deleted = await _imageStorageService.DeleteImageAsync(product.ImageFile);
                if (deleted)
                {
                    _logger.LogInformation("Successfully deleted product image from S3: ProductId={ProductId}, ImageUrl={ImageUrl}",
                        request.Id, product.ImageFile);
                }
                else
                {
                    _logger.LogWarning("Failed to delete product image from S3 (may not be an S3 URL): ProductId={ProductId}, ImageUrl={ImageUrl}",
                        request.Id, product.ImageFile);
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the product deletion
                _logger.LogError(ex, "Error deleting product image from S3: ProductId={ProductId}, ImageUrl={ImageUrl}",
                    request.Id, product.ImageFile);
            }
        }

        // Delete the product from database
        var result = await _productRepository.DeleteProduct(request.Id);

        if (result)
        {
            _logger.LogInformation("Successfully deleted product: Id={ProductId}", request.Id);
        }
        else
        {
            _logger.LogWarning("Failed to delete product from database: Id={ProductId}", request.Id);
        }

        return result;
    }
}