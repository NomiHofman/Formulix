import sql from 'mssql';

const config = {
  server: process.env.AZURE_SQL_SERVER || 'formulix-srv-22042026.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'FormulixDB',
  user: process.env.AZURE_SQL_USER || 'formulixadmin',
  password: process.env.AZURE_SQL_PASSWORD,
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  connectionTimeout: 15000,
  requestTimeout: 30000,
};

let pool = null;

async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(config);
  return pool;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getPool();

    const [countResult, formulaResult, logResult, summaryResult] = await Promise.all([
      db.request().query('SELECT COUNT(*) AS cnt FROM t_data'),
      db.request().query(
        'SELECT targil_id, targil, tnai, targil_false FROM t_targil ORDER BY targil_id'
      ),
      db.request().query(
        'SELECT log_id, targil_id, method, run_time FROM t_log ORDER BY method, targil_id'
      ),
      db.request().query(`
        SELECT method,
               ROUND(AVG(run_time), 4)  AS avg,
               ROUND(MIN(run_time), 4)  AS min,
               ROUND(MAX(run_time), 4)  AS max,
               COUNT(*)                 AS runs
        FROM t_log GROUP BY method
      `),
    ]);

    const dataCount = countResult.recordset[0].cnt;
    const formulas = formulaResult.recordset;
    const logs = logResult.recordset;

    const summary = {};
    for (const row of summaryResult.recordset) {
      summary[row.method] = {
        avg: row.avg,
        min: row.min,
        max: row.max,
        runs: row.runs,
        total_ops: dataCount * formulas.length,
      };
    }

    return res.status(200).json({
      exportedAt: new Date().toISOString(),
      dataCount,
      formulaCount: formulas.length,
      formulas,
      logs,
      summary,
      source: 'live-db',
    });
  } catch (err) {
    pool = null;
    return res.status(500).json({
      error: 'Database error',
      detail: err.message,
    });
  }
}
