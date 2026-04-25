namespace Formulix.Shared.Configuration;

public sealed class DatabaseSettings
{
    /// <summary>
    /// Set FORMULIX_DB_CONNECTION for Azure (or any SQL Server). No secrets in source control.
    /// Default: LocalDB for local dev / examiners on Windows.
    /// </summary>
    public string ConnectionString { get; set; } =
        Environment.GetEnvironmentVariable("FORMULIX_DB_CONNECTION")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=Formulix;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=False;Connection Timeout=300;";
}