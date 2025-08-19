const { getPool } = require('../config/db');

async function findByEmail(email) {
    const pool = await getPool();
    const [rows] = await pool.query(
        'SELECT id, email, password, name, role, status, deleted FROM users WHERE email = ? LIMIT 1',
        [email]
    );
    return rows[0] || null;
}
async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(
        'SELECT id, email, password, name, role, status, google_id, deleted FROM users WHERE id = ? LIMIT 1',
        [id]
    );
    return rows[0] || null;
}
async function createUser({ email, passwordHash, name }) {
    const pool = await getPool();
    const [res] = await pool.query(
        'INSERT INTO users (email, password, name, status, deleted) VALUES (?, ?, ?, "INACTIVE", FALSE)',
        [email, passwordHash, name]
    );
    return res.insertId;
}
async function activateUserByEmail(email) {
    const pool = await getPool();
    await pool.query('UPDATE users SET status = "ACTIVE" WHERE email = ?', [email]);
}
async function createUserWithGoogle({ email, name, googleId }) {
    const pool = await getPool();
    const [res] = await pool.query(
        `INSERT INTO users (email, password, name, role, google_id, status, deleted)
     VALUES (?, NULL, ?, 'ADMIN', ?, 'ACTIVE', FALSE)`,
        [email, name, googleId]
    );
    const id = res.insertId;
    const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [id]);
    return rows[0];
}
async function updateGoogleIdAndActivate({ email, googleId }) {
    const pool = await getPool();
    await pool.query(
        `UPDATE users SET google_id = ?, status='ACTIVE' WHERE email = ?`,
        [googleId, email]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
    return rows[0] || null;
}
module.exports = {
    findByEmail,
    findById,
    createUser,
    activateUserByEmail,
    createUserWithGoogle,
    updateGoogleIdAndActivate,
};
