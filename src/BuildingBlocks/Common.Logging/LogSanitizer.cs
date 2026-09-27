namespace Common.Logging;

/// <summary>
/// Neutralises user-controlled values before they are written to logs (CWE-117, log
/// forging): strips CR/LF so a value can't start a fake log entry in text sinks.
/// </summary>
public static class LogSanitizer
{
    public static string Sanitize(string? value) =>
        value is null ? string.Empty : value.Replace("\r", string.Empty).Replace("\n", string.Empty);
}
