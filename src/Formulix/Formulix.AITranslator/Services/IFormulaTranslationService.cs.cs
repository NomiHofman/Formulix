namespace Formulix.AITranslator.Services;

public interface IFormulaTranslationService
{
    Task<string> TranslateToCSharpExpressionAsync(string businessExpression, CancellationToken cancellationToken = default);
}