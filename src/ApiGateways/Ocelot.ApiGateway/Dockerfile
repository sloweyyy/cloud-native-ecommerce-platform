FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /repo
# Restore layer: copy only the project graph so `dotnet restore` is cached
# until a .csproj or central package version changes.
COPY ["global.json", "Directory.Packages.props", "./"]
COPY ["src/ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.csproj", "src/ApiGateways/Ocelot.ApiGateway/"]
RUN dotnet restore "src/ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.csproj"
COPY src/ src/
WORKDIR "/repo/src/ApiGateways/Ocelot.ApiGateway"
RUN dotnet build "./Ocelot.ApiGateway.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Ocelot.ApiGateway.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_HTTP_PORTS=80
ENTRYPOINT ["dotnet", "Ocelot.ApiGateway.dll"]