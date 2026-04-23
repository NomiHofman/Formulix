using System.Diagnostics;

namespace Formulix.Shared.Utilities;

public sealed class BenchmarkTimer
{
    private readonly Stopwatch _stopwatch = new();

    public void Start()
    {
        _stopwatch.Restart();
    }

    public double StopSeconds()
    {
        _stopwatch.Stop();
        return _stopwatch.Elapsed.TotalSeconds;
    }
}