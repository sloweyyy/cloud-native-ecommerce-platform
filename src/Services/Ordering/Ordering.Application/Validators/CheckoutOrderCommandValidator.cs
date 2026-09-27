using FluentValidation;
using Ordering.Application.Commands;

namespace Ordering.Application.Validators;

public class CheckoutOrderCommandValidator : AbstractValidator<CheckoutOrderCommand>
{
    public CheckoutOrderCommandValidator()
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
        RuleFor(o => o.EmailAddress)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(o => o.FirstName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(o => o.LastName)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}