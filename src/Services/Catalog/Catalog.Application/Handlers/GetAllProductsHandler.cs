using Catalog.Application.Mappers;
using Catalog.Application.Queries;
using Catalog.Application.Responses;
using Catalog.Core.Repositories;
using Catalog.Core.Specs;
using Common.Mediator;

namespace Catalog.Application.Handlers;

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, Pagination<ProductResponse>>
{
    private readonly IProductRepository _productRepository;

    public GetAllProductsHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Pagination<ProductResponse>> Handle(GetAllProductsQuery request,
        CancellationToken cancellationToken)
    {
        var productList = await _productRepository.GetProducts(request.CatalogSpecParams);
        var productResposeList = ProductMapper.Instance.ToProductResponsePagination(productList);
        return productResposeList;
    }
}