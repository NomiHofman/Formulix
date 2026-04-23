using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace Formulix.AITranslator;

/// <summary>
/// Compiles AI-translated formulas into executable C# delegates.
/// The AI translates business formulas to C#, then we compile with Roslyn.
/// </summary>
internal static class FormulaCompiler
{
    public static ScriptRunner<double> Compile(string expression)
    {
        ScriptOptions options = ScriptOptions.Default
            .AddImports("System", "System.Math");

        // Normalize in case AI returned SQL-style functions
        string normalized = NormalizeExpression(expression);

        Script<double> script = CSharpScript.Create<double>(
            normalized,
            options,
            typeof(Globals));

        script.Compile();

        return script.CreateDelegate();
    }

    public static string BuildBusinessExpression(string targil, string? tnai, string? targilFalse)
    {
        if (string.IsNullOrWhiteSpace(tnai))
        {
            return targil.Trim();
        }

        string condition = tnai.Trim();
        string trueExpr = targil.Trim();
        string falseExpr = (targilFalse ?? "0").Trim();

        return $"({condition}) ? ({trueExpr}) : ({falseExpr})";
    }

    private static string NormalizeExpression(string expression)
    {
        return expression
            .Replace("SQRT(", "Math.Sqrt(", StringComparison.OrdinalIgnoreCase)
            .Replace("LOG(", "Math.Log(", StringComparison.OrdinalIgnoreCase)
            .Replace("ABS(", "Math.Abs(", StringComparison.OrdinalIgnoreCase)
            .Replace("POWER(", "Math.Pow(", StringComparison.OrdinalIgnoreCase)
            .Trim();
    }
}