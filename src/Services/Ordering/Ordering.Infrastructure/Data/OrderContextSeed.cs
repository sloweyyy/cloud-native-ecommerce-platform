using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ordering.Core.Entities;

namespace Ordering.Infrastructure.Data;

public class OrderContextSeed
{
    public static async Task SeedAsync(OrderContext orderContext, ILogger<OrderContextSeed> logger,
        CancellationToken cancellationToken = default)
    {
        // Schema (including Activities) is owned by EF migrations; this only seeds data.
        if (!await orderContext.Orders.AnyAsync(cancellationToken))
        {
            orderContext.Orders.AddRange(GetOrders());
            await orderContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Ordering Database: {DbContext} seeded", nameof(OrderContext));
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
                EmailAddress = "user@example.com",
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