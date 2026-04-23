using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace Formulix.RoslynRunner;

/// <summary>
/// Compiles dynamic formulas from t_targil into executable C# delegates.
/// Supports: arithmetic, SQRT, LOG, ABS, POWER, and conditional expressions.
/// </summary>
internal static class FormulaCompiler
{
    public static ScriptRunner<double> Compile(string expression)
    {
        ScriptOptions options = ScriptOptions.Default
            .AddImports("System", "System.Math");

        Script<double> script = CSharpScript.Create<double>(
            expression,
            options,
            typeof(Globals));

        script.Compile();

        return script.CreateDelegate();
    }

    public static string BuildExpression(string targil, string? tnai, string? targilFalse)
    {
        if (string.IsNullOrWhiteSpace(tnai))
        {
            return NormalizeExpression(targil);
        }

        string condition = NormalizeCondition(tnai);
        string trueExpr = NormalizeExpression(targil);
        string falseExpr = NormalizeExpression(targilFalse ?? "0");

        return $"({condition}) ? ({trueExpr}) : ({falseExpr})";
    }

    private static string NormalizeExpression(string expression)
    {
        // Convert SQL-style functions to C# Math equivalents
        return expression
            .Replace("SQRT(", "Math.Sqrt(", StringComparison.OrdinalIgnoreCase)
            .Replace("LOG(", "Math.Log(", StringComparison.OrdinalIgnoreCase)
            .Replace("ABS(", "Math.Abs(", StringComparison.OrdinalIgnoreCase)
            .Replace("POWER(", "Math.Pow(", StringComparison.OrdinalIgnoreCase)
            .Replace("SIN(", "Math.Sin(", StringComparison.OrdinalIgnoreCase)
            .Replace("COS(", "Math.Cos(", StringComparison.OrdinalIgnoreCase)
            .Replace("TAN(", "Math.Tan(", StringComparison.OrdinalIgnoreCase)
            .Replace("EXP(", "Math.Exp(", StringComparison.OrdinalIgnoreCase)
            .Replace("CEILING(", "Math.Ceiling(", StringComparison.OrdinalIgnoreCase)
            .Replace("FLOOR(", "Math.Floor(", StringComparison.OrdinalIgnoreCase)
            .Replace("ROUND(", "Math.Round(", StringComparison.OrdinalIgnoreCase)
            .Replace("==", "==")
            .Trim();
    }

    private static string NormalizeCondition(string condition)
    {
        return condition.Trim();
    }
}