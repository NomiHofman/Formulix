using Formulix.Shared.Models;

namespace Formulix.Shared.Data;

public interface IFormulixRepository
{
    Task<IReadOnlyList<FormulaDefinition>> GetFormulasAsync(CancellationToken cancellationToken = default);

    IAsyncEnumerable<DataRecord> StreamDataAsync(CancellationToken cancellationToken = default);

    Task InsertResultsBulkAsync(IReadOnlyList<FormulaResult> results, CancellationToken cancellationToken = default);

    Task InsertLogAsync(LogEntry logEntry, CancellationToken cancellationToken = default);

    Task ClearResultsForMethodAsync(string method, CancellationToken cancellationToken = default);

    Task ClearLogsForMethodAsync(string method, CancellationToken cancellationToken = default);
}