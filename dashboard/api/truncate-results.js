import sql from 'mssql';
import { getMssqlConfig } from './lib/azureConfig.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { error, config } = getMssqlConfig();
  if (error) {
    return res.status(503).json({ error: 'Configuration required', detail: error });
  }

  let pool;
  try {
    pool = await sql.connect(config);
    await pool.request().query('TRUNCATE TABLE t_results');

    const info = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM t_results) AS results,
        (SELECT COUNT(*) FROM t_log) AS logs,
        (SELECT CAST(SUM(reserved_page_count) * 8.0 / 1024 AS DECIMAL(10,2))
         FROM sys.dm_db_partition_stats
         WHERE object_id = OBJECT_ID('t_results')) AS resultsMB
    `);

    return res.status(200).json({
      message: 't_results truncated (logs preserved)',
      ...info.recordset[0],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close();
  }
}
