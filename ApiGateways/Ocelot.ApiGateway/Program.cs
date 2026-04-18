using Microsoft.AspNetCore.HttpOverrides;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy => { policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin(); });
});

// Trust X-Forwarded-For / X-Forwarded-Proto set by the upstream nginx ingress so
// Ocelot resolves the real client IP for per-client rate limiting.
// The gateway is only reachable through the ingress (enforced by NetworkPolicy),
// so trusting the forwarded headers here is safe.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Clear built-in localhost-only restrictions; access is controlled at the network layer.
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});
//ocelot configuration
builder.Host.ConfigureAppConfiguration((env, config) =>
{
    config.AddJsonFile($"ocelot.{env.HostingEnvironment.EnvironmentName}.json", true, true);
});
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOcelot();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthorization();

app.MapControllers();

app.UseEndpoints(endpoints =>
{
    endpoints.MapGet("/", async context => { await context.Response.WriteAsync("Hello Ocelot"); });
});

await app.UseOcelot();
await app.RunAsync();