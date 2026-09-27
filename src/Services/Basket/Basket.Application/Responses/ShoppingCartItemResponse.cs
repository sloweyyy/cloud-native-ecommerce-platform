namespace Basket.Application.Responses;

public class ShoppingCartItemResponse
{
    public int Quantity { get; set; }
    public string ImageFile { get; set; }
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public string ProductId { get; set; }
    public string ProductName { get; set; }

    // Calculated property for the final price after discount
    public decimal FinalPrice => OriginalPrice - DiscountAmount;
}