namespace Formulix.Shared.Configuration;

public sealed class DatabaseSettings
{
    public string ConnectionString { get; set; } =
        Environment.GetEnvironmentVariable("FORMULIX_DB_CONNECTION")
        ?? "Server=tcp:formulix-srv-22042026.database.windows.net,1433;Initial Catalog=FormulixDB;Persist Security Info=False;User ID=formulixadmin;Password=Nh0583262051;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=300;";
}