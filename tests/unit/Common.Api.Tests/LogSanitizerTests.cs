using Common.Logging;

namespace Common.Api.Tests;

public class LogSanitizerTests
{
    [Theory]
    [InlineData("shoes", "shoes")]
    [InlineData("shoes\r\n[INF] Admin logged in", "shoes[INF] Admin logged in")]
    [InlineData("a\nb\rc", "abc")]
    [InlineData(null, "")]
    public void Strips_line_breaks(string? input, string expected)
    {
        LogSanitizer.Sanitize(input).ShouldBe(expected);
    }
}
