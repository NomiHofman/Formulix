namespace Formulix.Shared.Models;

public sealed class FormulaDefinition
{
    public int TargilId { get; set; }
    public string Targil { get; set; } = string.Empty;
    public string? Tnai { get; set; }
    public string? TargilFalse { get; set; }
}