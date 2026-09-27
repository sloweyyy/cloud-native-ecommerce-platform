using Catalog.Core.Entities;
using MongoDB.Driver;
using System.Text.Json;


namespace Catalog.Infrastructure.Data;

public static class CatalogContextSeed
{
    public static void SeedData(IMongoCollection<Product> productCollection)
    {
        var checkProducts = productCollection.Find(b => true).Any();

        // Determine which seed file to use based on environment
        var useLocalStack = Environment.GetEnvironmentVariable("USE_LOCALSTACK")?.ToLower() == "true";
        var seedFileName = useLocalStack ? "products-local.json" : "products.json";
        var path = Path.Combine("Data", "SeedData", seedFileName);

        if (!checkProducts)
        {
            var productsData = File.ReadAllText(path);
            //var productsData = File.ReadAllText("../Catalog.Infrastructure/Data/SeedData/products.json");
            var products = JsonSerializer.Deserialize<List<Product>>(productsData);
            if (products != null)
                foreach (var item in products)
                    productCollection.InsertOneAsync(item);
        }
    }
}