using Catalog.Application.Handlers;
using Catalog.Application.Queries;
using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using Catalog.Core.Specs;

namespace Catalog.Application.Tests;

public class CatalogSpecParamsTests
{
    [Fact]
    public void Defaults_are_first_page_of_12()
    {
        var spec = new CatalogSpecParams();

        spec.PageIndex.ShouldBe(1);
        spec.PageSize.ShouldBe(12);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(-5, 1)]
    [InlineData(1, 1)]
    [InlineData(3, 3)]
    public void PageIndex_is_at_least_one(int requested, int expected)
    {
        new CatalogSpecParams { PageIndex = requested }.PageIndex.ShouldBe(expected);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(-1, 1)]
    [InlineData(20, 20)]
    [InlineData(70, 70)]
    [InlineData(71, 70)]
    [InlineData(int.MaxValue, 70)]
    public void PageSize_is_clamped_between_1_and_70(int requested, int expected)
    {
        new CatalogSpecParams { PageSize = requested }.PageSize.ShouldBe(expected);
    }

    [Fact]
    public async Task GetAllProducts_passes_clamped_paging_to_the_repository()
    {
        var repository = Substitute.For<IProductRepository>();
        repository.GetProducts(Arg.Any<CatalogSpecParams>())
            .Returns(call =>
            {
                var spec = call.Arg<CatalogSpecParams>();
                return new Pagination<Product>(spec.PageIndex, spec.PageSize, 0, Array.Empty<Product>());
            });
        var handler = new GetAllProductsHandler(repository);

        var result = await handler.Handle(
            new GetAllProductsQuery(new CatalogSpecParams { PageIndex = 0, PageSize = 0 }), CancellationToken.None);

        result.PageIndex.ShouldBe(1);
        result.PageSize.ShouldBe(1);
        await repository.Received(1).GetProducts(Arg.Is<CatalogSpecParams>(s => s.PageIndex == 1 && s.PageSize == 1));
    }
}
