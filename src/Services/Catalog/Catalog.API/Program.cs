using Common.Mediator;
using Asp.Versioning;
using Catalog.Application.Handlers;
using Catalog.Core.Repositories;
using Catalog.Infrastructure.Data;
using Catalog.Infrastructure.Repositories;
using Common.Logging;
using EventBus.Messages.Common;
using MassTransit;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using System.Reflection;

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
            .AddSource("Catalog.API")
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("Catalog.API"))
            .AddAspNetCoreInstrumentation()
            .AddOtlpExporter(opts =>
            {
                opts.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"] ?? "http://jaeger-collector.istio-system:4317");
            });
    });

builder.Services.AddControllers();
// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.ReportApiVersions = true;
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.DefaultApiVersion = new ApiVersion(1, 0);
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Catalog.API", Version = "v1" });
});

// Mapperly mappers are accessed via static ProductMapper.Instance — no DI registration needed.

//Register Mediatr
var assemblies = new Assembly[]
{
    Assembly.GetExecutingAssembly(),
    typeof(GetAllBrandsHandler).Assembly
};
builder.Services.AddMediator(assemblies);

//Register Application Services
builder.Services.AddScoped<ICatalogContext, CatalogContext>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IBrandRepository, ProductRepository>();
builder.Services.AddScoped<ITypesRepository, ProductRepository>();

//Register AWS S3 Configuration
builder.Services.Configure<Catalog.Infrastructure.Services.AwsS3Settings>(
    builder.Configuration.GetSection("AWS:S3"));
builder.Services.Configure<Catalog.Infrastructure.Services.ImageSettings>(
    builder.Configuration.GetSection("ImageSettings"));

//Register AWS S3 Client with LocalStack support
var useLocalStackStr = builder.Configuration["USE_LOCALSTACK"];
var awsEndpointUrl = builder.Configuration["AWS_ENDPOINT_URL"];
var useLocalStack = !string.IsNullOrEmpty(useLocalStackStr) &&
                    (useLocalStackStr.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                     useLocalStackStr == "1");

if (useLocalStack && !string.IsNullOrEmpty(awsEndpointUrl))
{
    // Configure for LocalStack
    Console.WriteLine($"[S3 Config] Using LocalStack S3 at {awsEndpointUrl} with ForcePathStyle=true");
    var s3Config = new Amazon.S3.AmazonS3Config
    {
        ServiceURL = awsEndpointUrl,
        ForcePathStyle = true,
        AuthenticationRegion = "us-east-1",
        UseHttp = true
    };
    builder.Services.AddSingleton<Amazon.S3.IAmazonS3>(sp =>
        new Amazon.S3.AmazonS3Client(s3Config));
}
else
{
    // Configure for real AWS
    Console.WriteLine("[S3 Config] Using AWS S3");
    var region = builder.Configuration["AWS:S3:Region"] ?? "us-east-1";
    Console.WriteLine($"[S3 Config] AWS Region: {region}");

    var regionEndpoint = Amazon.RegionEndpoint.GetBySystemName(region);
    Console.WriteLine($"[S3 Config] Region Endpoint: {regionEndpoint?.SystemName ?? "null"}");

    // Set AWS_REGION environment variable for SDK - this is critical for endpoint resolution
    Environment.SetEnvironmentVariable("AWS_REGION", region);
    Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", region);

    var s3Config = new Amazon.S3.AmazonS3Config
    {
        ServiceURL = $"https://s3.{region}.amazonaws.com",
        AuthenticationRegion = region,
        UseHttp = false,
        MaxErrorRetry = 3
    };

    builder.Services.AddSingleton<Amazon.S3.IAmazonS3>(sp =>
    {
        Console.WriteLine($"[S3 Config] Creating S3 client with ServiceURL: {s3Config.ServiceURL}");

        // Use FallbackCredentialsFactory to get credentials from environment/IRSA
        var credentials = Amazon.Runtime.FallbackCredentialsFactory.GetCredentials();
        Console.WriteLine($"[S3 Config] Credentials type: {credentials?.GetType().Name ?? "null"}");

        var client = new Amazon.S3.AmazonS3Client(credentials, s3Config);
        Console.WriteLine($"[S3 Config] S3 client created successfully with explicit credentials");
        return client;
    });
}

//Register Image Storage Service
builder.Services.AddScoped<Catalog.Core.Services.IImageStorageService,
    Catalog.Infrastructure.Services.S3ImageStorageService>();

// Mass Transit Configuration
builder.Services.AddMassTransit(config =>
{
    config.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(builder.Configuration["EventBusSettings:HostAddress"]);
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseAuthorization();

app.MapControllers();

app.Run();