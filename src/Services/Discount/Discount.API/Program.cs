using Common.Mediator;
using Common.Logging;
using Discount.API.Services;
using Discount.Application.Handlers;
using Discount.Application.Mapper;
using Discount.Core.Repositories;
using Discount.Infrastructure.Extensions;
using Discount.Infrastructure.Repositories;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//Serilog configuration
builder.Host.UseSerilog(Logging.ConfigureLogger);

// OpenTelemetry Configuration
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
    {
        tracerProviderBuilder
            .AddSource("Discount.API")
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("Discount.API"))
            .AddAspNetCoreInstrumentation()
            .AddOtlpExporter(opts =>
            {
                opts.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"] ?? "http://jaeger-collector.istio-system:4317");
            });
    });

// Register Mapperly mappers (source-generated, replaces AutoMapper)
builder.Services.AddSingleton<DiscountMapper>();

//Register Mediatr
var assemblies = new Assembly[]
{
    Assembly.GetExecutingAssembly(),
    typeof(CreateDiscountCommandHandler).Assembly
};
builder.Services.AddMediator(assemblies);
builder.Services.AddScoped<IDiscountRepository, DiscountRepository>();
builder.Services.AddGrpc();

var app = builder.Build();

//Migrate Database
app.MigrateDatabase<Program>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapGrpcService<DiscountService>();
    endpoints.MapGet("/", async context =>
    {
        await context.Response.WriteAsync("Communication with grpc endpoints must be made through a grpc client");
    });
});

app.Run();