using Catalog.Application.Commands;
using Catalog.Application.Queries;
using Catalog.Application.Responses;
using Catalog.Core.Specs;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Catalog.API.Controllers;

public class CatalogController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ILogger<CatalogController> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    public CatalogController(
        IMediator mediator, 
        ILogger<CatalogController> logger,
        IPublishEndpoint publishEndpoint)
    {
        _mediator = mediator;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
    }

    [HttpGet]
    [Route("[action]/{id}", Name = "GetProductById")]
    [ProducesResponseType(typeof(ProductResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult<ProductResponse>> GetProductById(string id)
    {
        var query = new GetProductByIdQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet]
    [Route("[action]/{productName}", Name = "GetProductByProductName")]
    [ProducesResponseType(typeof(IList<ProductResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IList<ProductResponse>>> GetProductByProductName(string productName)
    {
        var query = new GetProductByNameQuery(productName);
        var result = await _mediator.Send(query);
        _logger.LogInformation($"Product with {productName} fetched");
        return Ok(result);
    }

    [HttpGet]
    [Route("GetAllProducts")]
    [ProducesResponseType(typeof(Pagination<ProductResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IList<ProductResponse>>> GetAllProducts(
        [FromQuery] CatalogSpecParams catalogSpecParams)
    {
        var query = new GetAllProductsQuery(catalogSpecParams);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet]
    [Route("GetAllBrands")]
    [ProducesResponseType(typeof(IList<BrandResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IList<BrandResponse>>> GetAllBrands()
    {
        var query = new GetAllBrandsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [Route("CreateBrand")]
    [ProducesResponseType(typeof(BrandResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<BrandResponse>> CreateBrand([FromBody] CreateBrandCommand brandCommand)
    {
        var result = await _mediator.Send<BrandResponse>(brandCommand);
        return Ok(result);
    }

    [HttpGet]
    [Route("GetAllTypes")]
    [ProducesResponseType(typeof(IList<TypesResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IList<TypesResponse>>> GetAllTypes()
    {
        var query = new GetAllTypesQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [Route("CreateType")]
    [ProducesResponseType(typeof(TypesResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<TypesResponse>> CreateType([FromBody] CreateTypeCommand typeCommand)
    {
        var result = await _mediator.Send<TypesResponse>(typeCommand);
        return Ok(result);
    }

    [HttpGet]
    [Route("[action]/{brand}", Name = "GetProductsByBrandName")]
    [ProducesResponseType(typeof(IList<ProductResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IList<ProductResponse>>> GetProductsByBrandName(string brand)
    {
        var query = new GetProductByBrandQuery(brand);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [Route("CreateProduct")]
    [ProducesResponseType(typeof(ProductResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] CreateProductCommand productCommand)
    {
        var result = await _mediator.Send<ProductResponse>(productCommand);
        
        // Publish ProductActivityEvent after successful creation
        if (result != null)
        {
            var eventMessage = new ProductActivityEvent
            {
                ActivityType = ProductActivityType.Created,
                ProductId = result.Id,
                ProductName = result.Name,
                Actor = "system", // TODO: Get from auth context
                OccurredAt = DateTime.UtcNow
            };
            
            await _publishEndpoint.Publish(eventMessage);
            _logger.LogInformation("ProductActivityEvent published for ProductId: {ProductId}", result.Id);
        }
        
        return Ok(result);
    }

    [HttpPost]
    [Route("UploadProductImage")]
    [ProducesResponseType(typeof(ImageUploadResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<ActionResult<ImageUploadResponse>> UploadProductImage([FromForm] IFormFile imageFile)
    {
        var command = new UploadProductImageCommand { ImageFile = imageFile };
        var result = await _mediator.Send(command);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPut]
    [Route("UpdateProduct")]
    [ProducesResponseType(typeof(bool), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ProductResponse>> UpdateProduct([FromBody] UpdateProductCommand productCommand)
    {
        var result = await _mediator.Send(productCommand);
        
        // Publish ProductActivityEvent after successful update
        if (result)
        {
            // Get product name for event (we need to fetch it or include in command)
            // For now, using productCommand.Name if available
            var eventMessage = new ProductActivityEvent
            {
                ActivityType = ProductActivityType.Updated,
                ProductId = productCommand.Id,
                ProductName = productCommand.Name ?? "Unknown",
                Actor = "system", // TODO: Get from auth context
                OccurredAt = DateTime.UtcNow
            };
            
            await _publishEndpoint.Publish(eventMessage);
            _logger.LogInformation("ProductActivityEvent published for ProductId: {ProductId}", productCommand.Id);
        }
        
        return Ok(result);
    }

    [HttpDelete]
    [Route("{id}", Name = "DeleteProduct")]
    [ProducesResponseType(typeof(bool), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ProductResponse>> DeleteProduct(string id)
    {
        var command = new DeleteProductByIdCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}