const mysql = require('mysql2/promise');
const env = require('./env');

let pool;
async function getPool() {
    if (!pool) {
        pool = await mysql.createPool({
            host: env.mysql.host,
            port: env.mysql.port,
            user: env.mysql.user,
            password: env.mysql.password,
            database: env.mysql.database,
            connectionLimit: 10,
        });
    }
    return pool;
}

module.exports = { getPool };
