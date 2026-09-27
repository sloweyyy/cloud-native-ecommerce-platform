using Catalog.Core.Entities;
using Catalog.Core.Specs;

namespace Catalog.Core.Repositories;

public interface IProductRepository
{
    Task<Pagination<Product>> GetProducts(CatalogSpecParams catalogSpecParams);
    Task<Product> GetProduct(string id);
    Task<IEnumerable<Product>> GetProductsByName(string name);
    Task<IEnumerable<Product>> GetProductsByBrand(string brandName);
    Task<IEnumerable<Product>> GetAllProducts();
    Task<Product> CreateProduct(Product product);
    Task<bool> UpdateProduct(Product product);
    Task<bool> DeleteProduct(string id);
}