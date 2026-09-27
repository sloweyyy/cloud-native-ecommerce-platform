using Catalog.Application.Commands;
using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using Catalog.Core.Services;
using Common.Mediator;
using Microsoft.Extensions.Logging;

namespace Catalog.Application.Handlers;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly IProductRepository _productRepository;
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<UpdateProductCommandHandler> _logger;

    public UpdateProductCommandHandler(
        IProductRepository productRepository,
        IImageStorageService imageStorageService,
        ILogger<UpdateProductCommandHandler> logger)
    {
        _productRepository = productRepository;
        _imageStorageService = imageStorageService;
        _logger = logger;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // Get the existing product to check if image URL has changed
        var existingProduct = await _productRepository.GetProduct(request.Id);

        if (existingProduct == null)
        {
            _logger.LogWarning("Product not found for update: Id={ProductId}", request.Id);
            return false;
        }

        // Check if the image URL has changed
        if (!string.IsNullOrWhiteSpace(existingProduct.ImageFile) &&
            !string.IsNullOrWhiteSpace(request.ImageFile) &&
            existingProduct.ImageFile != request.ImageFile)
        {
            // Image URL has changed - delete the old S3 image if it's an S3 URL
            try
            {
                var deleted = await _imageStorageService.DeleteImageAsync(existingProduct.ImageFile);
                if (deleted)
                {
                    _logger.LogInformation("Successfully deleted old product image from S3: ProductId={ProductId}, OldImageUrl={OldImageUrl}",
                        request.Id, existingProduct.ImageFile);
                }
                else
                {
                    _logger.LogWarning("Failed to delete old product image from S3 (may not be an S3 URL): ProductId={ProductId}, OldImageUrl={OldImageUrl}",
                        request.Id, existingProduct.ImageFile);
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the product update
                _logger.LogError(ex, "Error deleting old product image from S3: ProductId={ProductId}, OldImageUrl={OldImageUrl}",
                    request.Id, existingProduct.ImageFile);
            }
        }

        // Update the product
        var productEntity = await _productRepository.UpdateProduct(new Product
        {
            Id = request.Id,
            Description = request.Description,
            ImageFile = request.ImageFile,
            Name = request.Name,
            Price = request.Price,
            Summary = request.Summary,
            Brands = request.Brands,
            Types = request.Types
        });

        _logger.LogInformation("Successfully updated product: Id={ProductId}", request.Id);

        return true;
    }
}