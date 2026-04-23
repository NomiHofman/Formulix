namespace Formulix.Shared.Models;

public sealed class FormulaResult
{
    public int DataId { get; set; }
    public int TargilId { get; set; }
    public string Method { get; set; } = string.Empty;
    public double? Result { get; set; }
}