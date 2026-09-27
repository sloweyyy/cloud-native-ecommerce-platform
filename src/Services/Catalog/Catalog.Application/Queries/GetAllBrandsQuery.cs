using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Queries;

public class GetAllBrandsQuery : IRequest<IList<BrandResponse>>
{
}