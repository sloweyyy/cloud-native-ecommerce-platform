using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ordering.Core.Entities;

namespace Ordering.Infrastructure.Data;

public class OrderContextSeed
{
    public static async Task SeedAsync(OrderContext orderContext, ILogger<OrderContextSeed> logger)
    {
        // Ensure Activities table exists (migration might not have been applied)
        await EnsureActivitiesTableExistsAsync(orderContext, logger);

        if (!orderContext.Orders.Any())
        {
            orderContext.Orders.AddRange(GetOrders());
            await orderContext.SaveChangesAsync();
            logger.LogInformation($"Ordering Database: {typeof(OrderContext).Name} seeded!!!");
        }
    }

    private static async Task EnsureActivitiesTableExistsAsync(OrderContext orderContext, ILogger<OrderContextSeed> logger)
    {
        try
        {
            // Check if Activities table exists and create if not
            await orderContext.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Activities]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[Activities] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [EventId] uniqueidentifier NOT NULL,
                        [ActivityType] nvarchar(50) NOT NULL,
                        [EntityType] nvarchar(50) NOT NULL,
                        [EntityId] nvarchar(100) NOT NULL,
                        [Title] nvarchar(200) NOT NULL,
                        [Description] nvarchar(500) NULL,
                        [Actor] nvarchar(100) NULL,
                        [SourceService] nvarchar(50) NOT NULL,
                        [Metadata] nvarchar(max) NULL,
                        [OccurredAt] datetime2 NOT NULL,
                        [CreatedBy] nvarchar(max) NULL,
                        [CreatedDate] datetime2 NULL,
                        [LastModifiedBy] nvarchar(max) NULL,
                        [LastModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
                        CONSTRAINT [UX_Activities_EventId] UNIQUE ([EventId])
                    );

                    CREATE INDEX [IX_Activities_CreatedDate] ON [dbo].[Activities] ([CreatedDate]);
                    CREATE INDEX [IX_Activities_OccurredAt] ON [dbo].[Activities] ([OccurredAt]);
                    CREATE INDEX [IX_Activities_ActivityType] ON [dbo].[Activities] ([ActivityType]);
                    CREATE INDEX [IX_Activities_EntityType] ON [dbo].[Activities] ([EntityType]);
                END
            ");

            logger.LogInformation("Activities table ensured");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to ensure Activities table exists, it might already exist");
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