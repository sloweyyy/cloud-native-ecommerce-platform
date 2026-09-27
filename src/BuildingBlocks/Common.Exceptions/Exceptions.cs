namespace Common.Exceptions;

/// <summary>The requested resource does not exist (HTTP 404 / gRPC NotFound).</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string name, object key) : base($"Entity {name} - {key} is not found.")
    {
    }
}

/// <summary>
/// The request conflicts with the current state of a resource, e.g. a duplicate
/// unique name (HTTP 409 / gRPC AlreadyExists).
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}

/// <summary>The request is malformed or semantically invalid (HTTP 400 / gRPC InvalidArgument).</summary>
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
