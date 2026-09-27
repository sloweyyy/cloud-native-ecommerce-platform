using Catalog.Core.Entities;

namespace Catalog.Core.Repositories;

public interface ITypesRepository
{
    Task<IEnumerable<ProductType>> GetAllTypes();

    Task<ProductType> CreateType(ProductType type);

    Task<bool> TypeExists(string name);
}