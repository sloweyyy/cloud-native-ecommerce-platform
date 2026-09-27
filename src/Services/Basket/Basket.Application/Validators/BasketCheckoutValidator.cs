using Basket.Core.Entities;
using FluentValidation;

namespace Basket.Application.Validators;

/// <summary>
/// Validates a checkout before the basket is published and deleted. At least as strict
/// as Ordering's CheckoutOrderCommandValidator, otherwise the order would be rejected
/// downstream after the basket is already gone.
/// </summary>
public class BasketCheckoutValidator : AbstractValidator<BasketCheckout>
{
    public BasketCheckoutValidator()
    {
        RuleFor(o => o.UserName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(70)
            .WithMessage("{PropertyName} must not exceed 70 characters.");
        RuleFor(o => o.FirstName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(o => o.LastName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(o => o.EmailAddress)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .EmailAddress()
            .WithMessage("{PropertyName} '{PropertyValue}' is not a valid email address.");
    }
}
