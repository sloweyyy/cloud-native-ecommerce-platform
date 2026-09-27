using Catalog.Core.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Catalog.Infrastructure.Data;

/// <summary>
/// Thread-safe holder for the Mongo collections; registered as a singleton together with a
/// singleton <see cref="IMongoClient"/>. Indexes and seed data are handled once at startup by
/// <see cref="CatalogSeeder"/>, not per request.
/// </summary>
public class CatalogContext : ICatalogContext
{
    public IMongoCollection<Product> Products { get; }

    public IMongoCollection<ProductBrand> Brands { get; }

    public IMongoCollection<ProductType> Types { get; }

    public CatalogContext(IMongoClient client, IConfiguration configuration)
    {
        var database = client.GetDatabase(configuration.GetValue<string>("DatabaseSettings:DatabaseName"));
        Brands = database.GetCollection<ProductBrand>(
            configuration.GetValue<string>("DatabaseSettings:BrandsCollection"));
        Types = database.GetCollection<ProductType>(configuration.GetValue<string>("DatabaseSettings:TypesCollection"));
        Products = database.GetCollection<Product>(configuration.GetValue<string>("DatabaseSettings:CollectionName"));
    }
}