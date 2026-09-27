using Common.Mediator;
using Microsoft.AspNetCore.Http;

namespace Catalog.Application.Commands;

/// <summary>
/// Command for uploading a product image to S3 storage
/// </summary>
public class UploadProductImageCommand : IRequest<ImageUploadResponse>
{
    public IFormFile ImageFile { get; set; } = null!;
}

/// <summary>
/// Response model for image upload operation
/// </summary>
public class ImageUploadResponse
{
    public bool Success { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}
