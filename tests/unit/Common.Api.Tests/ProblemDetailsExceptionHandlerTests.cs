using System.Text.Json;
using Common.Exceptions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Common.Api.Tests;

public class ProblemDetailsExceptionHandlerTests
{
    private static async Task<(int Status, JsonElement Body)> Handle(Exception exception, string environment = "Production")
    {
        var hostEnvironment = Substitute.For<IHostEnvironment>();
        hostEnvironment.EnvironmentName.Returns(environment);

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(hostEnvironment);
        services.AddApiProblemDetails();
        await using var provider = services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateScopes = true,
            ValidateOnBuild = true,
        });

        var context = new DefaultHttpContext { RequestServices = provider };
        context.Request.Method = "GET";
        context.Request.Path = "/api/v1/test";
        context.Response.Body = new MemoryStream();

        var handler = provider.GetServices<IExceptionHandler>().OfType<ProblemDetailsExceptionHandler>().Single();
        var handled = await handler.TryHandleAsync(context, exception, CancellationToken.None);
        handled.ShouldBeTrue();

        context.Response.ContentType.ShouldStartWith("application/problem+json");
        context.Response.Body.Position = 0;
        using var doc = await JsonDocument.ParseAsync(context.Response.Body);
        return (context.Response.StatusCode, doc.RootElement.Clone());
    }

    [Fact]
    public async Task ValidationException_maps_to_400_with_errors_dictionary()
    {
        var exception = new ValidationException(new[]
        {
            new ValidationFailure("UserName", "'User Name' must not be empty."),
            new ValidationFailure("UserName", "'User Name' must not exceed 70 characters."),
            new ValidationFailure("EmailAddress", "'Email Address' is not a valid email address."),
        });

        var (status, body) = await Handle(exception);

        status.ShouldBe(400);
        body.GetProperty("status").GetInt32().ShouldBe(400);
        var errors = body.GetProperty("errors");
        errors.GetProperty("UserName").GetArrayLength().ShouldBe(2);
        errors.GetProperty("EmailAddress")[0].GetString().ShouldBe("'Email Address' is not a valid email address.");
    }

    [Fact]
    public async Task NotFoundException_maps_to_404()
    {
        var (status, body) = await Handle(new NotFoundException("Order", 42));

        status.ShouldBe(404);
        body.GetProperty("detail").GetString().ShouldBe("Entity Order - 42 is not found.");
    }

    [Fact]
    public async Task Derived_not_found_exception_maps_to_404()
    {
        var (status, _) = await Handle(new ProductMissingException());

        status.ShouldBe(404);
    }

    [Fact]
    public async Task ConflictException_maps_to_409()
    {
        var (status, body) = await Handle(new ConflictException("Brand 'Adidas' already exists"));

        status.ShouldBe(409);
        body.GetProperty("detail").GetString().ShouldBe("Brand 'Adidas' already exists");
    }

    [Fact]
    public async Task BadRequestException_maps_to_400()
    {
        var (status, _) = await Handle(new BadRequestException("Brand name is required"));

        status.ShouldBe(400);
    }

    [Fact]
    public async Task Unexpected_exception_maps_to_500_without_details_outside_development()
    {
        var (status, body) = await Handle(new InvalidOperationException("connection string: secret"));

        status.ShouldBe(500);
        body.TryGetProperty("detail", out _).ShouldBeFalse();
        body.GetRawText().ShouldNotContain("secret");
        body.GetRawText().ShouldNotContain("   at ");
    }

    [Fact]
    public async Task Unexpected_exception_includes_details_in_development()
    {
        var (status, body) = await Handle(new InvalidOperationException("boom"), Environments.Development);

        status.ShouldBe(500);
        body.GetProperty("detail").GetString()!.ShouldContain("boom");
    }

    [Fact]
    public async Task Problem_details_include_trace_id()
    {
        var (_, body) = await Handle(new NotFoundException("missing"));

        body.TryGetProperty("traceId", out _).ShouldBeTrue();
    }

    private sealed class ProductMissingException() : NotFoundException("Product", "abc");
}
