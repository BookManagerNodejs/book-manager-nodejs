const { getPool } = require('../config/db');
async function listAll() {
    const pool = await getPool();
    const [rows] = await pool.query(
        'SELECT id, name FROM categories ORDER BY name ASC'
    );
    return rows;
}
module.exports = { listAll };
