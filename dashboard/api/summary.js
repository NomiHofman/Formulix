import sql from 'mssql';
import { getMssqlConfig } from './lib/azureConfig.js';

let pool = null;

async function getPool() {
  if (pool) return pool;
  const { error, config } = getMssqlConfig();
  if (error) {
    const err = new Error(error);
    err.statusCode = 503;
    throw err;
  }
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
    const code = err.statusCode === 503 ? 503 : 500;
    return res.status(code).json({
      error: err.statusCode === 503 ? 'Configuration required' : 'Database error',
      detail: err.message,
    });
  }
}
