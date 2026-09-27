using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Queries;

public class GetProductByBrandQuery : IRequest<IList<ProductResponse>>
{
    public string BrandName { get; set; }

    public GetProductByBrandQuery(string brandName)
    {
        BrandName = brandName;
    }
}