using Catalog.Application.Commands;
using Catalog.Core.Services;
using Common.Mediator;
using Microsoft.Extensions.Logging;

namespace Catalog.Application.Handlers;

/// <summary>
/// Handler for uploading product images to S3 storage
/// </summary>
public class UploadProductImageCommandHandler : IRequestHandler<UploadProductImageCommand, ImageUploadResponse>
{
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<UploadProductImageCommandHandler> _logger;

    public UploadProductImageCommandHandler(
        IImageStorageService imageStorageService,
        ILogger<UploadProductImageCommandHandler> logger)
    {
        _imageStorageService = imageStorageService ?? throw new ArgumentNullException(nameof(imageStorageService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ImageUploadResponse> Handle(UploadProductImageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate that a file was provided
            if (request.ImageFile == null || request.ImageFile.Length == 0)
            {
                _logger.LogWarning("Upload attempt with no file provided");
                return new ImageUploadResponse
                {
                    Success = false,
                    ErrorMessage = "No file was provided for upload"
                };
            }

            _logger.LogInformation("Starting image upload: FileName={FileName}, Size={Size} bytes",
                request.ImageFile.FileName, request.ImageFile.Length);

            // Get content type
            var contentType = request.ImageFile.ContentType;
            if (string.IsNullOrWhiteSpace(contentType))
            {
                contentType = "application/octet-stream";
            }

            // Upload to S3
            using var stream = request.ImageFile.OpenReadStream();
            var imageUrl = await _imageStorageService.UploadImageAsync(
                stream,
                request.ImageFile.FileName,
                contentType);

            _logger.LogInformation("Successfully uploaded image: URL={Url}", imageUrl);

            return new ImageUploadResponse
            {
                Success = true,
                ImageUrl = imageUrl
            };
        }
        catch (ArgumentException ex)
        {
            // Validation errors (file type, size, etc.)
            _logger.LogWarning(ex, "Image upload validation failed: {Message}", ex.Message);
            return new ImageUploadResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
        catch (Exception ex)
        {
            // Unexpected errors
            _logger.LogError(ex, "Failed to upload image: {Message}", ex.Message);
            return new ImageUploadResponse
            {
                Success = false,
                ErrorMessage = $"Failed to upload image: {ex.Message}"
            };
        }
    }
}
