FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /repo
# Restore layer: copy only the project graph so `dotnet restore` is cached
# until a .csproj or central package version changes.
COPY ["Directory.Packages.props", "./"]
COPY ["src/BuildingBlocks/Common.Logging/Common.Logging.csproj", "src/BuildingBlocks/Common.Logging/"]
COPY ["src/BuildingBlocks/Common.Mediator/Common.Mediator.csproj", "src/BuildingBlocks/Common.Mediator/"]
COPY ["src/BuildingBlocks/EventBus.Messages/EventBus.Messages.csproj", "src/BuildingBlocks/EventBus.Messages/"]
COPY ["src/Services/Catalog/Catalog.API/Catalog.API.csproj", "src/Services/Catalog/Catalog.API/"]
COPY ["src/Services/Catalog/Catalog.Application/Catalog.Application.csproj", "src/Services/Catalog/Catalog.Application/"]
COPY ["src/Services/Catalog/Catalog.Core/Catalog.Core.csproj", "src/Services/Catalog/Catalog.Core/"]
COPY ["src/Services/Catalog/Catalog.Infrastructure/Catalog.Infrastructure.csproj", "src/Services/Catalog/Catalog.Infrastructure/"]
RUN dotnet restore "src/Services/Catalog/Catalog.API/Catalog.API.csproj"
COPY src/ src/
WORKDIR "/repo/src/Services/Catalog/Catalog.API"
RUN dotnet build "./Catalog.API.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Catalog.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_HTTP_PORTS=80
ENTRYPOINT ["dotnet", "Catalog.API.dll"]
