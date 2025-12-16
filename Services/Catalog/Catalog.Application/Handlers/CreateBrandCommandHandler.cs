using Catalog.Application.Commands;
using Catalog.Application.Mappers;
using Catalog.Application.Responses;
using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using MediatR;

namespace Catalog.Application.Handlers;

public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, BrandResponse>
{
  private readonly IBrandRepository _brandRepository;

  public CreateBrandCommandHandler(IBrandRepository brandRepository)
  {
    _brandRepository = brandRepository;
  }

  public async Task<BrandResponse> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
  {
    if (string.IsNullOrWhiteSpace(request.Name))
      throw new ArgumentException("Brand name is required", nameof(request.Name));

    var brandEntity = ProductMapper.Mapper.Map<ProductBrand>(request);
    if (brandEntity is null)
      throw new ApplicationException("There is an issue with mapping while creating new brand");

    var newBrand = await _brandRepository.CreateBrand(brandEntity);
    var brandResponse = ProductMapper.Mapper.Map<BrandResponse>(newBrand);
    return brandResponse;
  }
}
