/**
 * Azure SQL config for Vercel serverless routes.
 * Never commit real passwords — set AZURE_SQL_* in Vercel / local .env (not in git).
 */
export function getMssqlConfig(overrides = {}) {
  const server = process.env.AZURE_SQL_SERVER;
  const database = process.env.AZURE_SQL_DATABASE || 'FormulixDB';
  const user = process.env.AZURE_SQL_USER;
  const password = process.env.AZURE_SQL_PASSWORD;

  if (!server || !user || !password) {
    return {
      error:
        'Database not configured. Set environment variables: AZURE_SQL_SERVER, ' +
        'AZURE_SQL_USER, AZURE_SQL_PASSWORD (and optionally AZURE_SQL_DATABASE).',
    };
  }

  return {
    config: {
      server,
      database,
      user,
      password,
      port: 1433,
      options: {
        encrypt: true,
        trustServerCertificate: false,
        ...(overrides.options || {}),
      },
      connectionTimeout: overrides.connectionTimeout ?? 15000,
      requestTimeout: overrides.requestTimeout ?? 30000,
    },
  };
}
