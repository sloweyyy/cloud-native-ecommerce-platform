using System.Text.Json;
using Catalog.Core.Entities;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace Catalog.Infrastructure.Data;

/// <summary>
/// One-time startup initialisation for the catalog database: creates indexes and seeds the
/// brand/type/product reference data when the collections are empty. Safe to run concurrently
/// from several replicas: seed documents carry fixed ids, so racing inserts collide on _id and
/// the duplicates are ignored.
/// </summary>
public class CatalogSeeder
{
    // Case-insensitive comparison, matching the ToLower() checks in ProductRepository.
    public static readonly Collation CaseInsensitive = new("en", strength: CollationStrength.Secondary);

    private const int DuplicateKeyErrorCode = 11000;

    private readonly ICatalogContext _context;
    private readonly ILogger<CatalogSeeder> _logger;

    public CatalogSeeder(ICatalogContext context, ILogger<CatalogSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await EnsureUniqueNameIndexAsync(_context.Brands, cancellationToken);
            await EnsureUniqueNameIndexAsync(_context.Types, cancellationToken);

            await SeedCollectionAsync(_context.Brands, "brands.json", cancellationToken);
            await SeedCollectionAsync(_context.Types, "types.json", cancellationToken);

            var useLocalStack = Environment.GetEnvironmentVariable("USE_LOCALSTACK")?.ToLower() == "true";
            await SeedCollectionAsync(_context.Products, useLocalStack ? "products-local.json" : "products.json",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "Catalog database initialisation failed; shutting down");
            throw;
        }
    }

    private async Task EnsureUniqueNameIndexAsync<T>(IMongoCollection<T> collection,
        CancellationToken cancellationToken) where T : BaseEntity
    {
        var model = new CreateIndexModel<T>(
            Builders<T>.IndexKeys.Ascending("Name"),
            new CreateIndexOptions { Name = "ux_name", Unique = true, Collation = CaseInsensitive });
        try
        {
            await collection.Indexes.CreateOneAsync(model, cancellationToken: cancellationToken);
        }
        catch (MongoCommandException ex) when (ex.Code == DuplicateKeyErrorCode)
        {
            // Legacy data with duplicate names: keep serving; the repository's exists-check still
            // applies, but an operator must de-duplicate before the index can be built.
            _logger.LogWarning(ex, "Collection {Collection} has duplicate names; unique index not created",
                collection.CollectionNamespace.CollectionName);
        }
    }

    private async Task SeedCollectionAsync<T>(IMongoCollection<T> collection, string seedFile,
        CancellationToken cancellationToken)
    {
        if (await collection.Find(FilterDefinition<T>.Empty).AnyAsync(cancellationToken))
            return;

        var path = Path.Combine(AppContext.BaseDirectory, "Data", "SeedData", seedFile);
        var items = JsonSerializer.Deserialize<List<T>>(await File.ReadAllTextAsync(path, cancellationToken));
        if (items is null || items.Count == 0)
            return;

        try
        {
            await collection.InsertManyAsync(items, new InsertManyOptions { IsOrdered = false },
                cancellationToken);
        }
        catch (MongoBulkWriteException ex) when (ex.WriteErrors.All(e => e.Category == ServerErrorCategory.DuplicateKey))
        {
            // Another replica seeded concurrently; the remaining documents were still inserted.
        }

        _logger.LogInformation("Seeded {Collection} from {SeedFile}",
            collection.CollectionNamespace.CollectionName, seedFile);
    }
}
