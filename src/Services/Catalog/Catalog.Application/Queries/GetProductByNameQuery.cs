using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Queries;

public class GetProductByNameQuery : IRequest<IList<ProductResponse>>
{
    public string Name { get; set; }

    public GetProductByNameQuery(string name)
    {
        Name = name;
    }
}