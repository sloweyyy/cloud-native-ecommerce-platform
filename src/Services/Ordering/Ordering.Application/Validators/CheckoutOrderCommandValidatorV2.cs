using FluentValidation;
using Ordering.Application.Commands;

namespace Ordering.Application.Validators;

public class CheckoutOrderCommandValidatorV2 : AbstractValidator<CheckoutOrderCommandV2>
{
    public CheckoutOrderCommandValidatorV2()
    {
        RuleFor(o => o.UserName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(70)
            .WithMessage("{PropertyName} must not exceed 70 characters.");
        RuleFor(o => o.TotalPrice)
            .NotNull()
            .WithMessage("{PropertyName} is required.")
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must not be negative, but was {PropertyValue}.");
    }
}