using Catalog.Application.Responses;
using MediatR;

namespace Catalog.Application.Commands;

public class CreateBrandCommand : IRequest<BrandResponse>
{
  public string Name { get; set; }
}
