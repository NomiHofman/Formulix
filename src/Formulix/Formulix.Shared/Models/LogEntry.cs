namespace Formulix.Shared.Models;

public sealed class LogEntry
{
    public int TargilId { get; set; }
    public string Method { get; set; } = string.Empty;
    public double RunTime { get; set; }
}