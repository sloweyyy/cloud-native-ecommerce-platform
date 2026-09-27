using Catalog.Application.Mappers;
using Catalog.Application.Queries;
using Catalog.Application.Responses;
using Catalog.Core.Repositories;
using Common.Mediator;

namespace Catalog.Application.Handlers;

public class GetProductByBrandHandler : IRequestHandler<GetProductByBrandQuery, IList<ProductResponse>>
{
    private readonly IProductRepository _productRepository;

    public GetProductByBrandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IList<ProductResponse>> Handle(GetProductByBrandQuery request,
        CancellationToken cancellationToken)
    {
        var productList = await _productRepository.GetProductsByBrand(request.BrandName);
        var productResponseList = ProductMapper.Instance.ToProductResponseList(productList);
        return productResponseList;
    }
}