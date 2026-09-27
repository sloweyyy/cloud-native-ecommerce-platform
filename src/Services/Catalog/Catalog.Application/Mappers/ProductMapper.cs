using Catalog.Application.Commands;
using Catalog.Application.Responses;
using Catalog.Core.Entities;
using Catalog.Core.Specs;
using Riok.Mapperly.Abstractions;

namespace Catalog.Application.Mappers;

[Mapper]
public partial class ProductMapper
{
    public static readonly ProductMapper Instance = new();

    public partial ProductResponse ToProductResponse(Product product);
    public partial IList<ProductResponse> ToProductResponseList(IEnumerable<Product> products);

    public partial BrandResponse ToBrandResponse(ProductBrand brand);
    public partial IList<BrandResponse> ToBrandResponseList(IEnumerable<ProductBrand> brands);

    public partial TypesResponse ToTypesResponse(ProductType type);
    public partial IList<TypesResponse> ToTypesResponseList(IEnumerable<ProductType> types);

    // Id is database-generated on insert.
    [MapperIgnoreTarget(nameof(Product.Id))]
    public partial Product ToProduct(CreateProductCommand command);

    [MapperIgnoreTarget(nameof(ProductBrand.Id))]
    public partial ProductBrand ToProductBrand(CreateBrandCommand command);

    [MapperIgnoreTarget(nameof(ProductType.Id))]
    public partial ProductType ToProductType(CreateTypeCommand command);

    public Pagination<ProductResponse> ToProductResponsePagination(Pagination<Product> source) => new()
    {
        PageIndex = source.PageIndex,
        PageSize = source.PageSize,
        Count = source.Count,
        Data = source.Data.Select(ToProductResponse).ToList(),
    };
}
