using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Ordering.Infrastructure.Data;

public static class DbUpdateExceptionExtensions
{
    // 2601: duplicate key in unique index, 2627: unique/primary key constraint violation.
    public static bool IsUniqueConstraintViolation(this DbUpdateException exception) =>
        exception.InnerException is SqlException { Number: 2601 or 2627 };
}
