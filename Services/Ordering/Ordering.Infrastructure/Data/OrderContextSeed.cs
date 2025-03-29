using Microsoft.Extensions.Logging;
using Ordering.Core.Entities;

namespace Ordering.Infrastructure.Data;

public class OrderContextSeed
{
    public static async Task SeedAsync(OrderContext orderContext, ILogger<OrderContextSeed> logger)
    {
        if (!orderContext.Orders.Any())
        {
            orderContext.Orders.AddRange(GetOrders());
            await orderContext.SaveChangesAsync();
            logger.LogInformation($"Ordering Database: {typeof(OrderContext).Name} seeded!!!");
        }
    }

    private static IEnumerable<Order> GetOrders()
    {
        return new List<Order>
        {
            new()
            {
                UserName = "slowey",
                FirstName = "phuc",
                LastName = "truong",
                EmailAddress = "truonglevinhphuc2006@gmail.com",
                AddressLine = "Ho Chi Minh city",
                Country = "Vietnam",
                TotalPrice = 750,
                State = "Ho Chi Minh",
                ZipCode = "700000",

                CardName = "Visa",
                CardNumber = "1234567890",
                CreatedBy = "slowey",
                Expiration = "12/25",
                Cvv = "123",
                PaymentMethod = 1,
                LastModifiedBy = "slowey",
                LastModifiedDate = new DateTime()
            }
        };
    }
}