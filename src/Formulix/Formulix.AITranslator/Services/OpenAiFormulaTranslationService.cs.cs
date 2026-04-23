using OpenAI.Chat;

namespace Formulix.AITranslator.Services;

public sealed class OpenAiFormulaTranslationService : IFormulaTranslationService
{
    private readonly ChatClient _client;

    public OpenAiFormulaTranslationService()
    {
        string? apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("OPENAI_API_KEY is not set.");
        }

        _client = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);
    }

    public async Task<string> TranslateToCSharpExpressionAsync(
        string businessExpression,
        CancellationToken cancellationToken = default)
    {
        string prompt =
$"""
Translate the following business formula into a valid C# expression.

Rules:
- Return ONLY the C# expression
- Use variables a, b, c, d exactly as-is
- Do not add explanations
- Do not wrap in markdown
- Keep deterministic numeric behavior
- If the formula already matches valid C# syntax, return it unchanged
- Conditional logic must use the C# ternary operator

Business formula:
{businessExpression}
""";

        ChatCompletion completion =
            await _client.CompleteChatAsync(
                [new UserChatMessage(prompt)],
                cancellationToken: cancellationToken);

        string result = completion.Content[0].Text.Trim();

        if (string.IsNullOrWhiteSpace(result))
        {
            throw new InvalidOperationException("OpenAI returned an empty translation.");
        }

        return result;
    }
}