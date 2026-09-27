using Common.Exceptions;

namespace Catalog.Core.Exceptions;

/// <summary>Raised when creating an entity whose unique name already exists (HTTP 409).</summary>
public class DuplicateEntityException : ConflictException
{
    public DuplicateEntityException(string entityName, string name)
        : base($"{entityName} '{name}' already exists")
    {
    }
}
