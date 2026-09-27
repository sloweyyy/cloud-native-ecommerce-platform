using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Queries;

public class GetAllTypesQuery : IRequest<IList<TypesResponse>>
{
}