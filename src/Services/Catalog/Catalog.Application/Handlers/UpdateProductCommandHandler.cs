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

        // Update the product first; the old image must survive if the DB write fails.
        var updated = await _productRepository.UpdateProduct(new Product
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

        if (!updated)
        {
            _logger.LogWarning("Product update was not applied: Id={ProductId}", request.Id);
            return false;
        }

        _logger.LogInformation("Successfully updated product: Id={ProductId}", request.Id);

        // The image URL changed and the product no longer references the old one: clean it up.
        if (!string.IsNullOrWhiteSpace(existingProduct.ImageFile) &&
            !string.IsNullOrWhiteSpace(request.ImageFile) &&
            existingProduct.ImageFile != request.ImageFile)
        {
            await DeleteOldImageAsync(request.Id, existingProduct.ImageFile);
        }

        return true;
    }

    private async Task DeleteOldImageAsync(string productId, string oldImageUrl)
    {
        try
        {
            var deleted = await _imageStorageService.DeleteImageAsync(oldImageUrl);
            if (deleted)
            {
                _logger.LogInformation("Successfully deleted old product image from S3: ProductId={ProductId}, OldImageUrl={OldImageUrl}",
                    productId, oldImageUrl);
            }
            else
            {
                _logger.LogWarning("Failed to delete old product image from S3 (may not be an S3 URL): ProductId={ProductId}, OldImageUrl={OldImageUrl}",
                    productId, oldImageUrl);
            }
        }
        catch (Exception ex)
        {
            // The product is already updated; an orphaned image is preferable to failing the request.
            _logger.LogError(ex, "Error deleting old product image from S3: ProductId={ProductId}, OldImageUrl={OldImageUrl}",
                productId, oldImageUrl);
        }
    }
}