using Catalog.Application.Commands;
using Catalog.Core.Repositories;
using Catalog.Core.Services;
using Common.Mediator;
using Microsoft.Extensions.Logging;

namespace Catalog.Application.Handlers;

/// <summary>
/// Handler for migrating product images from local storage to S3
/// </summary>
public class MigrateImagesToS3CommandHandler : IRequestHandler<MigrateImagesToS3Command, MigrationReport>
{
    private readonly IProductRepository _productRepository;
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<MigrateImagesToS3CommandHandler> _logger;

    // Path to local images (relative to the project root)
    private const string LocalImagesPath = "/app/images/products";

    public MigrateImagesToS3CommandHandler(
        IProductRepository productRepository,
        IImageStorageService imageStorageService,
        ILogger<MigrateImagesToS3CommandHandler> logger)
    {
        _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        _imageStorageService = imageStorageService ?? throw new ArgumentNullException(nameof(imageStorageService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<MigrationReport> Handle(MigrateImagesToS3Command request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting migration of product images to S3");

        var report = new MigrationReport();

        try
        {
            // Get all products using the repository
            var productsEnumerable = await _productRepository.GetAllProducts();
            var products = productsEnumerable.ToList();
            report.TotalProducts = products.Count;

            _logger.LogInformation("Found {Count} products to process", products.Count);

            foreach (var product in products)
            {
                var detail = new MigrationDetail
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    OldImagePath = product.ImageFile
                };

                try
                {
                    // Check if product has an image file
                    if (string.IsNullOrWhiteSpace(product.ImageFile))
                    {
                        detail.Status = "Skipped";
                        detail.ErrorMessage = "No image file specified";
                        report.SkippedProducts++;
                        report.Details.Add(detail);
                        continue;
                    }

                    // Check if already migrated (S3 URL)
                    if (product.ImageFile.Contains("s3.amazonaws.com") ||
                        product.ImageFile.StartsWith("https://"))
                    {
                        detail.Status = "Skipped";
                        detail.ErrorMessage = "Already using S3 or external URL";
                        report.SkippedProducts++;
                        report.Details.Add(detail);
                        _logger.LogInformation("Product {ProductId} already has S3/external URL, skipping", product.Id);
                        continue;
                    }

                    // Extract filename from path (e.g., "images/products/image.png" -> "image.png")
                    var fileName = Path.GetFileName(product.ImageFile);
                    var localFilePath = Path.Combine(LocalImagesPath, fileName);

                    // Check if local file exists
                    if (!File.Exists(localFilePath))
                    {
                        detail.Status = "Failed";
                        detail.ErrorMessage = $"Local file not found: {localFilePath}";
                        report.FailedMigrations++;
                        report.Details.Add(detail);
                        _logger.LogWarning("Local image file not found: {Path} for product {ProductId}",
                            localFilePath, product.Id);
                        continue;
                    }

                    _logger.LogInformation("Uploading image for product {ProductId}: {FileName}",
                        product.Id, fileName);

                    // Upload to S3
                    using var fileStream = File.OpenRead(localFilePath);
                    var contentType = GetContentType(fileName);
                    var s3Url = await _imageStorageService.UploadImageAsync(fileStream, fileName, contentType);

                    // Update product with S3 URL
                    product.ImageFile = s3Url;
                    await _productRepository.UpdateProduct(product);

                    detail.Status = "Success";
                    detail.NewImageUrl = s3Url;
                    report.SuccessfulMigrations++;
                    report.Details.Add(detail);

                    _logger.LogInformation("Successfully migrated image for product {ProductId}: {OldPath} -> {NewUrl}",
                        product.Id, detail.OldImagePath, s3Url);
                }
                catch (Exception ex)
                {
                    detail.Status = "Failed";
                    detail.ErrorMessage = ex.Message;
                    report.FailedMigrations++;
                    report.Details.Add(detail);

                    _logger.LogError(ex, "Failed to migrate image for product {ProductId}: {ImageFile}",
                        product.Id, product.ImageFile);
                }
            }

            _logger.LogInformation("Migration completed: {Summary}", report.Summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error during migration process");
            throw;
        }

        return report;
    }

    /// <summary>
    /// Get content type based on file extension
    /// </summary>
    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }
}
