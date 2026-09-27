namespace Catalog.Core.Services;

/// <summary>
/// Service interface for managing product image storage in AWS S3
/// </summary>
public interface IImageStorageService
{
    /// <summary>
    /// Uploads an image to S3 storage
    /// </summary>
    /// <param name="imageStream">The image file stream</param>
    /// <param name="fileName">The original filename</param>
    /// <param name="contentType">The content type (e.g., image/png)</param>
    /// <returns>The full S3 URL of the uploaded image</returns>
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string contentType);

    /// <summary>
    /// Deletes an image from S3 storage
    /// </summary>
    /// <param name="imageUrl">The full S3 URL of the image to delete</param>
    /// <returns>True if deletion was successful, false otherwise</returns>
    Task<bool> DeleteImageAsync(string imageUrl);

    /// <summary>
    /// Extracts the S3 object key from a full S3 URL
    /// </summary>
    /// <param name="imageUrl">The full S3 URL</param>
    /// <returns>The S3 object key</returns>
    string ExtractKeyFromUrl(string imageUrl);
}
