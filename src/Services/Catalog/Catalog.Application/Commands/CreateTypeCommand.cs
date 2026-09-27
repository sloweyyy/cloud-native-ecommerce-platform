using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Commands;

public class CreateTypeCommand : IRequest<TypesResponse>
{
  public string Name { get; set; }
}
