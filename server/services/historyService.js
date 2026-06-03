const { getPool } = require('../config/db');

async function listHistory(search = '') {
  if (!process.env.MYSQL_HOST) return [];
  const pool = getPool();
  const like = `%${search}%`;
  const [rows] = await pool.execute(
    `SELECT id, calculator_type, input_data, result, timestamp
     FROM calculation_history
     WHERE calculator_type LIKE ? OR input_data LIKE ? OR result LIKE ?
     ORDER BY timestamp DESC
     LIMIT 200`,
    [like, like, like]
  );
  return rows;
}

async function createHistory(entry) {
  if (!process.env.MYSQL_HOST) return { id: entry.id || Date.now(), ...entry };
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO calculation_history (calculator_type, input_data, result)
     VALUES (?, ?, ?)`,
    [entry.calculator_type, entry.input_data, entry.result]
  );
  return { id: result.insertId, ...entry };
}

async function clearHistory() {
  if (!process.env.MYSQL_HOST) return { deleted: 0 };
  const pool = getPool();
  const [result] = await pool.execute('DELETE FROM calculation_history');
  return { deleted: result.affectedRows };
}

module.exports = { listHistory, createHistory, clearHistory };
