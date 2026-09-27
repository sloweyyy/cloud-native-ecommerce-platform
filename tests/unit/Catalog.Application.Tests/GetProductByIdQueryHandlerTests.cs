using Catalog.Application.Handlers;
using Catalog.Application.Queries;
using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using Common.Exceptions;

namespace Catalog.Application.Tests;

public class GetProductByIdQueryHandlerTests
{
    private readonly IProductRepository _repository = Substitute.For<IProductRepository>();

    [Fact]
    public async Task Missing_product_throws_NotFoundException()
    {
        _repository.GetProduct("6563e3d5f0a1b2c3d4e5f6a7").Returns((Product)null!);
        var handler = new GetProductByIdQueryHandler(_repository);

        var ex = await Should.ThrowAsync<NotFoundException>(
            () => handler.Handle(new GetProductByIdQuery("6563e3d5f0a1b2c3d4e5f6a7"), CancellationToken.None));

        ex.Message.ShouldContain("6563e3d5f0a1b2c3d4e5f6a7");
    }

    [Fact]
    public async Task Existing_product_is_mapped_to_response()
    {
        var product = new Product
        {
            Id = "6563e3d5f0a1b2c3d4e5f6a7",
            Name = "Adidas Quick Force Indoor Badminton Shoes",
            Price = 150m,
            Brands = new ProductBrand { Id = "b1", Name = "Adidas" },
            Types = new ProductType { Id = "t1", Name = "Shoes" },
        };
        _repository.GetProduct(product.Id).Returns(product);
        var handler = new GetProductByIdQueryHandler(_repository);

        var response = await handler.Handle(new GetProductByIdQuery(product.Id), CancellationToken.None);

        response.Id.ShouldBe(product.Id);
        response.Name.ShouldBe(product.Name);
        response.Price.ShouldBe(150m);
    }
}
