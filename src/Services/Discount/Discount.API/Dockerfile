#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

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
COPY ["global.json", "Directory.Packages.props", "./"]
COPY ["src/BuildingBlocks/Common.Logging/Common.Logging.csproj", "src/BuildingBlocks/Common.Logging/"]
COPY ["src/BuildingBlocks/Common.Mediator/Common.Mediator.csproj", "src/BuildingBlocks/Common.Mediator/"]
COPY ["src/Services/Discount/Discount.API/Discount.API.csproj", "src/Services/Discount/Discount.API/"]
COPY ["src/Services/Discount/Discount.Application/Discount.Application.csproj", "src/Services/Discount/Discount.Application/"]
COPY ["src/Services/Discount/Discount.Core/Discount.Core.csproj", "src/Services/Discount/Discount.Core/"]
COPY ["src/Services/Discount/Discount.Infrastructure/Discount.Infrastructure.csproj", "src/Services/Discount/Discount.Infrastructure/"]
RUN dotnet restore "src/Services/Discount/Discount.API/Discount.API.csproj"
COPY src/ src/
WORKDIR "/repo/src/Services/Discount/Discount.API"
RUN dotnet build "./Discount.API.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Discount.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Discount.API.dll"]