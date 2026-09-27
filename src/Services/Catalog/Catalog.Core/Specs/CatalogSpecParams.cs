namespace Catalog.Core.Specs;

public class CatalogSpecParams
{
    public const int MaxPageSize = 70;
    private int _pageIndex = 1;
    private int _pageSize = 12;

    // 1-based. Values below 1 would produce a negative skip in the repository.
    public int PageIndex
    {
        get => _pageIndex;
        set => _pageIndex = Math.Max(1, value);
    }

    // Clamped to 1..MaxPageSize: 0 would otherwise mean "no limit" to MongoDB.
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, MaxPageSize);
    }

    public string? BrandId { get; set; }
    public string? TypeId { get; set; }
    public string? Sort { get; set; }
    public string? Search { get; set; }
}