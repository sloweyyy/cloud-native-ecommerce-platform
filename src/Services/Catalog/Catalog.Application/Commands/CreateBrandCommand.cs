using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Commands;

public class CreateBrandCommand : IRequest<BrandResponse>
{
  public string Name { get; set; }
}
