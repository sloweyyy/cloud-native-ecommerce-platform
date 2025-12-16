using Catalog.Application.Commands;
using Catalog.Application.Mappers;
using Catalog.Application.Responses;
using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using MediatR;

namespace Catalog.Application.Handlers;

public class CreateTypeCommandHandler : IRequestHandler<CreateTypeCommand, TypesResponse>
{
  private readonly ITypesRepository _typesRepository;

  public CreateTypeCommandHandler(ITypesRepository typesRepository)
  {
    _typesRepository = typesRepository;
  }

  public async Task<TypesResponse> Handle(CreateTypeCommand request, CancellationToken cancellationToken)
  {
    if (string.IsNullOrWhiteSpace(request.Name))
      throw new ArgumentException("Type name is required", nameof(request.Name));

    var typeEntity = ProductMapper.Mapper.Map<ProductType>(request);
    if (typeEntity is null)
      throw new ApplicationException("There is an issue with mapping while creating new type");

    var newType = await _typesRepository.CreateType(typeEntity);
    var typeResponse = ProductMapper.Mapper.Map<TypesResponse>(newType);
    return typeResponse;
  }
}
