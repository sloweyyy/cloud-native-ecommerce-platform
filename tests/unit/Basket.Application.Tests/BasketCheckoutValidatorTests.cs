using Basket.Application.Validators;
using Basket.Core.Entities;

namespace Basket.Application.Tests;

public class BasketCheckoutValidatorTests
{
    private readonly BasketCheckoutValidator _validator = new();

    private static BasketCheckout Valid() => new()
    {
        UserName = "alice",
        FirstName = "Alice",
        LastName = "Smith",
        EmailAddress = "alice@example.com",
    };

    [Fact]
    public void Valid_checkout_passes()
    {
        _validator.Validate(Valid()).IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData(nameof(BasketCheckout.UserName))]
    [InlineData(nameof(BasketCheckout.FirstName))]
    [InlineData(nameof(BasketCheckout.LastName))]
    [InlineData(nameof(BasketCheckout.EmailAddress))]
    public void Missing_required_field_fails(string property)
    {
        var checkout = Valid();
        typeof(BasketCheckout).GetProperty(property)!.SetValue(checkout, "");

        var result = _validator.Validate(checkout);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == property);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("alice.example.com")]
    public void Malformed_email_fails(string email)
    {
        var checkout = Valid();
        checkout.EmailAddress = email;

        var result = _validator.Validate(checkout);

        result.Errors.ShouldHaveSingleItem().PropertyName.ShouldBe(nameof(BasketCheckout.EmailAddress));
    }

    [Fact]
    public void UserName_longer_than_70_characters_fails()
    {
        var checkout = Valid();
        checkout.UserName = new string('a', 71);

        _validator.Validate(checkout).IsValid.ShouldBeFalse();
    }

    [Fact]
    public void Messages_substitute_the_property_name()
    {
        var checkout = Valid();
        checkout.FirstName = "";

        var error = _validator.Validate(checkout).Errors.ShouldHaveSingleItem();

        error.ErrorMessage.ShouldBe("First Name is required.");
    }

    [Fact]
    public void V2_requires_user_name()
    {
        var validator = new BasketCheckoutV2Validator();

        validator.Validate(new BasketCheckoutV2 { UserName = "" }).IsValid.ShouldBeFalse();
        validator.Validate(new BasketCheckoutV2 { UserName = "alice" }).IsValid.ShouldBeTrue();
    }
}
