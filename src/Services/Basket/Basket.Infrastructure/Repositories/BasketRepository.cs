using System.Text.Json;
using Basket.Core.Entities;
using Basket.Core.Repositories;
using Microsoft.Extensions.Caching.Distributed;

namespace Basket.Infrastructure.Repositories;

public class BasketRepository : IBasketRepository
{
    // Newtonsoft's default was case-insensitive matching; System.Text.Json is
    // case-sensitive by default. Match the old behaviour so existing cached
    // baskets continue to deserialize.
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IDistributedCache _redisCache;

    public BasketRepository(IDistributedCache redisCache)
    {
        _redisCache = redisCache;
    }

    public async Task<ShoppingCart> GetBasket(string userName)
    {
        var basket = await _redisCache.GetStringAsync(userName);
        if (string.IsNullOrEmpty(basket)) return null;
        return JsonSerializer.Deserialize<ShoppingCart>(basket, JsonOptions);
    }

    public async Task<ShoppingCart> UpdateBasket(ShoppingCart shoppingCart)
    {
        await _redisCache.SetStringAsync(shoppingCart.UserName, JsonSerializer.Serialize(shoppingCart));
        return await GetBasket(shoppingCart.UserName);
    }

    public async Task DeleteBasket(string userName)
    {
        await _redisCache.RemoveAsync(userName);
    }
}