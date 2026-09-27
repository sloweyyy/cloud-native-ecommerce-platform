using Common.Exceptions;

namespace Ordering.Application.Exceptions;

public class OrderNotFoundException : NotFoundException
{
    public OrderNotFoundException(string name, object key) : base(name, key)
    {
    }
}