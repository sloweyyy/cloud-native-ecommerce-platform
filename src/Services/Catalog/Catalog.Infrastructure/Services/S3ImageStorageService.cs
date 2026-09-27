using Amazon.S3;
using Amazon.S3.Model;
using Catalog.Core.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Catalog.Infrastructure.Services;

/// <summary>
/// AWS S3 implementation of the image storage service
/// </summary>
public class S3ImageStorageService : IImageStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly AwsS3Settings _s3Settings;
    private readonly ImageSettings _imageSettings;
    private readonly ILogger<S3ImageStorageService> _logger;

    public S3ImageStorageService(
        IAmazonS3 s3Client,
        IOptions<AwsS3Settings> s3Settings,
        IOptions<ImageSettings> imageSettings,
        ILogger<S3ImageStorageService> logger)
    {
        _s3Client = s3Client ?? throw new ArgumentNullException(nameof(s3Client));
        _s3Settings = s3Settings.Value ?? throw new ArgumentNullException(nameof(s3Settings));
        _imageSettings = imageSettings.Value ?? throw new ArgumentNullException(nameof(imageSettings));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Uploads an image to S3 storage
    /// </summary>
    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string contentType)
    {
        try
        {
            // Validate file extension
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            if (!_imageSettings.AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", _imageSettings.AllowedExtensions)}");
            }

            // Validate file size
            if (imageStream.Length > _imageSettings.MaxFileSizeInMB * 1024 * 1024)
            {
                throw new ArgumentException($"File size exceeds the maximum allowed size of {_imageSettings.MaxFileSizeInMB}MB");
            }

            // Generate unique filename
            var uniqueFileName = GenerateUniqueFileName(fileName);
            var key = $"{_s3Settings.ImagePrefix}{uniqueFileName}";

            _logger.LogInformation("Uploading image to S3: Bucket={Bucket}, Key={Key}", _s3Settings.BucketName, key);

            // Upload to S3
            // Note: We don't set CannedACL here because the bucket policy handles public read access
            var putRequest = new PutObjectRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key,
                InputStream = imageStream,
                ContentType = contentType
            };

            var response = await _s3Client.PutObjectAsync(putRequest);

            if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception($"Failed to upload image to S3. Status code: {response.HttpStatusCode}");
            }

            // Generate the public URL
            string imageUrl;
            if (!string.IsNullOrEmpty(_s3Settings.ServiceUrl))
            {
                // LocalStack path-style URL
                imageUrl = $"{_s3Settings.ServiceUrl}/{_s3Settings.BucketName}/{key}";
            }
            else
            {
                // AWS virtual-hosted style URL
                imageUrl = $"https://{_s3Settings.BucketName}.s3.{_s3Settings.Region}.amazonaws.com/{key}";
            }

            _logger.LogInformation("Successfully uploaded image to S3: URL={Url}", imageUrl);

            return imageUrl;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "AWS S3 error occurred while uploading image: {ErrorCode} - {Message}", ex.ErrorCode, ex.Message);
            throw new Exception($"Failed to upload image to S3: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while uploading image to S3");
            throw;
        }
    }

    /// <summary>
    /// Deletes an image from S3 storage
    /// </summary>
    public async Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            // Check if URL is an S3 URL
            if (string.IsNullOrWhiteSpace(imageUrl) ||
                (!imageUrl.Contains("s3.amazonaws.com") &&
                 !imageUrl.Contains(_s3Settings.BucketName) &&
                 (string.IsNullOrEmpty(_s3Settings.ServiceUrl) ||
                  !imageUrl.StartsWith(_s3Settings.ServiceUrl))))
            {
                _logger.LogWarning("Attempted to delete non-S3 URL or empty URL: {Url}", imageUrl);
                return false;
            }

            // Extract key from URL
            var key = ExtractKeyFromUrl(imageUrl);
            if (string.IsNullOrWhiteSpace(key))
            {
                _logger.LogWarning("Failed to extract key from URL: {Url}", imageUrl);
                return false;
            }

            _logger.LogInformation("Deleting image from S3: Bucket={Bucket}, Key={Key}", _s3Settings.BucketName, key);

            // Delete from S3
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key
            };

            var response = await _s3Client.DeleteObjectAsync(deleteRequest);

            var success = response.HttpStatusCode == System.Net.HttpStatusCode.NoContent ||
                          response.HttpStatusCode == System.Net.HttpStatusCode.OK;

            if (success)
            {
                _logger.LogInformation("Successfully deleted image from S3: Key={Key}", key);
            }
            else
            {
                _logger.LogWarning("Failed to delete image from S3: Status={Status}, Key={Key}", response.HttpStatusCode, key);
            }

            return success;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Image doesn't exist - consider this a success
            _logger.LogInformation("Image not found in S3 (already deleted?): {Url}", imageUrl);
            return true;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "AWS S3 error occurred while deleting image: {ErrorCode} - {Message}", ex.ErrorCode, ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting image from S3: {Url}", imageUrl);
            return false;
        }
    }

    /// <summary>
    /// Extracts the S3 object key from a full S3 URL
    /// </summary>
    public string ExtractKeyFromUrl(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return string.Empty;
        }

        try
        {
            // Handle different S3 URL formats:
            // 1. https://bucket-name.s3.region.amazonaws.com/key (AWS virtual-hosted)
            // 2. https://s3.region.amazonaws.com/bucket-name/key (AWS path-style)
            // 3. http://localstack:4566/bucket-name/key (LocalStack path-style)

            var uri = new Uri(imageUrl);
            var path = uri.AbsolutePath.TrimStart('/');

            // Check if this is a LocalStack URL
            if (!string.IsNullOrEmpty(_s3Settings.ServiceUrl) &&
                imageUrl.StartsWith(_s3Settings.ServiceUrl))
            {
                // LocalStack format: http://localstack:4566/bucket/key
                if (path.StartsWith(_s3Settings.BucketName + "/"))
                {
                    return path.Substring(_s3Settings.BucketName.Length + 1);
                }
                return path;
            }

            // AWS virtual-hosted style
            if (uri.Host.StartsWith(_s3Settings.BucketName))
            {
                return path;
            }

            // AWS path-style
            if (path.StartsWith(_s3Settings.BucketName + "/"))
            {
                return path.Substring(_s3Settings.BucketName.Length + 1);
            }

            // Default: return the path as-is
            return path;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract key from URL: {Url}", imageUrl);
            return string.Empty;
        }
    }

    /// <summary>
    /// Generates a unique filename to prevent collisions
    /// </summary>
    private string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);

        // Sanitize filename: remove special characters, keep alphanumeric and dashes/underscores
        var sanitizedName = new string(fileNameWithoutExtension
            .Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_')
            .ToArray());

        // Generate timestamp
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");

        // Generate short random string for additional uniqueness
        var random = Guid.NewGuid().ToString("N").Substring(0, 8);

        return $"{sanitizedName}_{timestamp}_{random}{extension}";
    }
}

/// <summary>
/// Configuration settings for AWS S3
/// </summary>
public class AwsS3Settings
{
    public string BucketName { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string ImagePrefix { get; set; } = "products/";
    public string? ServiceUrl { get; set; }  // For LocalStack endpoint
    public bool UsePathStyle { get; set; } = false;  // For path-style URLs
}

/// <summary>
/// Configuration settings for image validation
/// </summary>
public class ImageSettings
{
    public int MaxFileSizeInMB { get; set; } = 5;
    public List<string> AllowedExtensions { get; set; } = new() { ".png", ".jpg", ".jpeg", ".webp" };
}
