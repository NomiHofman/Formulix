namespace Formulix.AITranslator.Services;

public sealed class MockFormulaTranslationService : IFormulaTranslationService
{
    public Task<string> TranslateToCSharpExpressionAsync(string businessExpression, CancellationToken cancellationToken = default)
    {
        string translated = NormalizeExpression(businessExpression);
        return Task.FromResult(translated);
    }

    private static string NormalizeExpression(string expression)
    {
        return expression
            .Replace("if(", "(", StringComparison.OrdinalIgnoreCase)
            .Trim();
    }
}