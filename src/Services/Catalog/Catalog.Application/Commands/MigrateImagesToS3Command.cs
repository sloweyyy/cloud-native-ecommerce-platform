using Common.Mediator;

namespace Catalog.Application.Commands;

/// <summary>
/// Command for migrating existing product images from local storage to S3
/// </summary>
public class MigrateImagesToS3Command : IRequest<MigrationReport>
{
}

/// <summary>
/// Report of migration results
/// </summary>
public class MigrationReport
{
    public int TotalProducts { get; set; }
    public int SuccessfulMigrations { get; set; }
    public int FailedMigrations { get; set; }
    public int SkippedProducts { get; set; }
    public List<MigrationDetail> Details { get; set; } = new();
    public string Summary => $"Total: {TotalProducts}, Success: {SuccessfulMigrations}, Failed: {FailedMigrations}, Skipped: {SkippedProducts}";
}

/// <summary>
/// Detail of a single product migration
/// </summary>
public class MigrationDetail
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? OldImagePath { get; set; }
    public string? NewImageUrl { get; set; }
    public string? ErrorMessage { get; set; }
}
