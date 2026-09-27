using Ordering.Application.Commands;
using Ordering.Application.Validators;

namespace Ordering.Application.Tests;

public class CheckoutOrderCommandValidatorTests
{
    private readonly CheckoutOrderCommandValidator _validator = new();

    private static CheckoutOrderCommand Valid(decimal? totalPrice = 100m) => new()
    {
        UserName = "alice",
        TotalPrice = totalPrice,
        FirstName = "Alice",
        LastName = "Smith",
        EmailAddress = "alice@example.com",
    };

    [Fact]
    public void Valid_command_passes()
    {
        _validator.Validate(Valid()).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Zero_total_price_is_allowed()
    {
        // NotEmpty() used to reject 0 (e.g. a fully discounted basket).
        _validator.Validate(Valid(0m)).IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData(-0.5)]
    [InlineData(-1)]
    public void Negative_total_price_fails(double totalPrice)
    {
        // GreaterThan(-1) used to accept -0.5.
        var result = _validator.Validate(Valid((decimal)totalPrice));

        result.Errors.ShouldHaveSingleItem().PropertyName.ShouldBe(nameof(CheckoutOrderCommand.TotalPrice));
    }

    [Fact]
    public void Missing_total_price_fails()
    {
        _validator.Validate(Valid(null)).IsValid.ShouldBeFalse();
    }

    [Fact]
    public void Messages_substitute_property_name_and_value()
    {
        var command = Valid(-2m);
        command.UserName = "";

        var errors = _validator.Validate(command).Errors;

        errors.ShouldContain(e => e.ErrorMessage == "User Name is required.");
        errors.ShouldContain(e => e.ErrorMessage == "Total Price must not be negative, but was -2.");
        errors.ShouldAllBe(e => !e.ErrorMessage.Contains('{'));
    }

    [Theory]
    [InlineData(nameof(CheckoutOrderCommand.EmailAddress))]
    [InlineData(nameof(CheckoutOrderCommand.FirstName))]
    [InlineData(nameof(CheckoutOrderCommand.LastName))]
    public void Required_fields_fail_when_empty(string property)
    {
        var command = Valid();
        typeof(CheckoutOrderCommand).GetProperty(property)!.SetValue(command, null);

        _validator.Validate(command).Errors.ShouldContain(e => e.PropertyName == property);
    }

    [Fact]
    public void UserName_longer_than_70_characters_fails()
    {
        var command = Valid();
        command.UserName = new string('a', 71);

        _validator.Validate(command).Errors.ShouldHaveSingleItem().ErrorMessage
            .ShouldBe("User Name must not exceed 70 characters.");
    }
}

public class CheckoutOrderCommandValidatorV2Tests
{
    private readonly CheckoutOrderCommandValidatorV2 _validator = new();

    [Theory]
    [InlineData(0, true)]
    [InlineData(10, true)]
    [InlineData(-0.01, false)]
    public void Total_price_must_not_be_negative(double totalPrice, bool valid)
    {
        var command = new CheckoutOrderCommandV2 { UserName = "alice", TotalPrice = (decimal)totalPrice };

        _validator.Validate(command).IsValid.ShouldBe(valid);
    }
}

public class UpdateOrderCommandValidatorTests
{
    private readonly UpdateOrderCommandValidator _validator = new();

    private static UpdateOrderCommand Valid() => new()
    {
        Id = 1,
        UserName = "alice",
        TotalPrice = 0m,
        FirstName = "Alice",
        LastName = "Smith",
        EmailAddress = "alice@example.com",
    };

    [Fact]
    public void Valid_command_with_zero_total_passes()
    {
        _validator.Validate(Valid()).IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Id_must_be_positive(int id)
    {
        var command = Valid();
        command.Id = id;

        _validator.Validate(command).Errors.ShouldHaveSingleItem().PropertyName.ShouldBe(nameof(UpdateOrderCommand.Id));
    }
}
