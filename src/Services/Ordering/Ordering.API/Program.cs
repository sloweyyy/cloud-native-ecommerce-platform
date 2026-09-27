using Asp.Versioning;
using Common.Api;
using Common.Logging;
using MassTransit;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Ordering.API.EventBusConsumer;
using Ordering.API.Extensions;
using Ordering.Application.Extensions;
using Ordering.Infrastructure.Data;
using Ordering.Infrastructure.Extensions;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//Add Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy => { policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin(); });
});


//Serilog configuration
builder.Host.UseSerilog(Logging.ConfigureLogger);

// OpenTelemetry Configuration
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
    {
        tracerProviderBuilder
            .AddSource("Ordering.API")
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("Ordering.API"))
            .AddAspNetCoreInstrumentation()
            .AddOtlpExporter(opts =>
            {
                opts.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"] ?? "http://jaeger-collector.istio-system:4317");
            });
    });

builder.Services.AddControllers();

// RFC 7807 problem details + shared exception -> status code mapping
builder.Services.AddApiProblemDetails();

// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.ReportApiVersions = true;
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.DefaultApiVersion = new ApiVersion(1, 0);
});

//Application Services
builder.Services.AddApplicationServices();

//Infra services
builder.Services.AddInfraServices(builder.Configuration);

//Consumer class
builder.Services.AddScoped<BasketOrderingConsumer>();
builder.Services.AddScoped<BasketOrderingConsumerV2>();
builder.Services.AddScoped<ProductActivityConsumer>();
builder.Services.AddScoped<OrderActivityConsumer>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Ordering.API", Version = "v1" });
});

// Mass Transit
builder.Services.AddMassTransit(config =>
{
    // Mark this as consumer
    config.AddOrderingConsumers();
    config.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(builder.Configuration["EventBusSettings:HostAddress"]);
        // Retry policy + receive endpoints (queues) for the consumers
        cfg.ConfigureOrderingEndpoints(ctx);
    });
});

var app = builder.Build();

// Must be first so it wraps every other middleware (replaces UseDeveloperExceptionPage).
app.UseApiExceptionHandler();

//Apply db migration + seed; throws (and stops the process) if the database cannot be migrated
await app.MigrateDatabaseAsync<OrderContext>((context, services, ct) =>
    OrderContextSeed.SeedAsync(context, services.GetRequiredService<ILogger<OrderContextSeed>>(), ct));
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseAuthorization();

app.MapControllers();

app.Run();