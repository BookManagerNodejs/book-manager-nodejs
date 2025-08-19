const { getPool } = require('../config/db');

async function listAllWithPriceRange({ minPrice = null, maxPrice = null }) {
    const pool = await getPool();
    const sql = `
    SELECT id, title, author, price, image, description, stock, sold, category_id, created_at, deleted
    FROM books
    WHERE (? IS NULL OR price >= ?)
      AND (? IS NULL OR price <= ?)
    ORDER BY created_at DESC, id DESC
  `;
    const params = [minPrice, minPrice, maxPrice, maxPrice];
    const [rows] = await pool.query(sql, params);
    return rows;
}
async function getById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(
        `SELECT id, title, author, price, image, description, stock, sold, category_id, created_at, deleted
     FROM books WHERE id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
}
async function create(book) {
    const pool = await getPool();
    const {
        title, author, price, image, description, stock, sold = 0, category_id
    } = book;

    const [res] = await pool.query(
        `INSERT INTO books (title, author, price, image, description, stock, sold, category_id, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [title, author, price, image, description, stock, sold, category_id]
    );
    return res.insertId;
}
async function softDelete(id) {
    const pool = await getPool();
    const [res] = await pool.query(
        `UPDATE books SET deleted = TRUE WHERE id = ? AND deleted = FALSE`,
        [id]
    );
    return res.affectedRows; // 1 nếu xóa mềm thành công, 0 nếu đã deleted trước đó/không tồn tại
}
async function restore(id) {
    const pool = await getPool();
    const [res] = await pool.query(
        `UPDATE books SET deleted = FALSE WHERE id = ? AND deleted = TRUE`,
        [id]
    );
    return res.affectedRows;
}
async function categoryExists(categoryId) {
    const pool = await getPool();
    const [rows] = await pool.query(
        `SELECT id FROM categories WHERE id = ? LIMIT 1`,
        [categoryId]
    );
    return !!rows[0];
}
module.exports = {
    listAllWithPriceRange,
    getById,
    create,
    softDelete,
    restore,
    categoryExists,
};
