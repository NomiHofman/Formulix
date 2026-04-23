using Formulix.Shared.Models;

namespace Formulix.Shared.Data;

public interface IFormulixRepository
{
    Task<IReadOnlyList<FormulaDefinition>> GetFormulasAsync(CancellationToken cancellationToken = default);

    IAsyncEnumerable<DataRecord> StreamDataAsync(CancellationToken cancellationToken = default);

    Task InsertResultsBulkAsync(IReadOnlyList<FormulaResult> results, CancellationToken cancellationToken = default);

    Task InsertResultsStreamAsync(
        IAsyncEnumerable<FormulaResult> rows,
        int batchSize = 50_000,
        CancellationToken cancellationToken = default);

    Task InsertLogAsync(LogEntry logEntry, CancellationToken cancellationToken = default);

    Task ClearResultsForMethodAsync(string method, CancellationToken cancellationToken = default);

    Task ClearLogsForMethodAsync(string method, CancellationToken cancellationToken = default);

    /// <summary>
    /// TRUNCATEs t_results and t_log entirely. Use ONLY when starting a fresh benchmark from scratch;
    /// compare_results.py needs all methods' data present simultaneously, so do not call between engines.
    /// </summary>
    Task TruncateAllResultsAsync(CancellationToken cancellationToken = default);
}