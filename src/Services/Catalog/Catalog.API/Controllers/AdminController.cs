using Catalog.Application.Commands;
using Common.Mediator;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Catalog.API.Controllers;

/// <summary>
/// Administrative operations controller
/// </summary>
public class AdminController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IMediator mediator, ILogger<AdminController> logger)
    {
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Migrates all product images from local storage to S3
    /// </summary>
    /// <returns>Migration report with details of successes and failures</returns>
    [HttpPost]
    [Route("MigrateImagesToS3")]
    [ProducesResponseType(typeof(MigrationReport), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
    public async Task<ActionResult<MigrationReport>> MigrateImagesToS3()
    {
        _logger.LogInformation("Migration request received");

        try
        {
            var command = new MigrateImagesToS3Command();
            var result = await _mediator.Send(command);

            _logger.LogInformation("Migration completed: {Summary}", result.Summary);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Migration failed with error: {Message}", ex.Message);
            return StatusCode((int)HttpStatusCode.InternalServerError,
                new { Error = "Migration failed", Message = ex.Message });
        }
    }
}
