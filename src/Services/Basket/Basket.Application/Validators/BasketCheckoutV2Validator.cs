using Basket.Core.Entities;
using FluentValidation;

namespace Basket.Application.Validators;

/// <summary>Mirrors Ordering's CheckoutOrderCommandValidatorV2.</summary>
public class BasketCheckoutV2Validator : AbstractValidator<BasketCheckoutV2>
{
    public BasketCheckoutV2Validator()
    {
        RuleFor(o => o.UserName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(70)
            .WithMessage("{PropertyName} must not exceed 70 characters.");
    }
}
