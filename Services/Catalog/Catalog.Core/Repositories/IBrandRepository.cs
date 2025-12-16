using Catalog.Core.Entities;

namespace Catalog.Core.Repositories;

public interface IBrandRepository
{
    Task<IEnumerable<ProductBrand>> GetAllBrands();

    Task<ProductBrand> CreateBrand(ProductBrand brand);

    Task<bool> BrandExists(string name);
}