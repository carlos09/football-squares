// const db = require('./db'); // Adjust this path based on your setup
const { Pool } = require('pg');

const pool = new Pool({
    user: 'carlosesquer',
    host: 'localhost',
    database: 'football_squares',
    password: 'Dexter09!',
    port: 5432,
});

async function checkUserRole(userId, role) {
    const result = await pool.query(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = $1 AND r.name = $2`,
        [userId, role],
    );
    return result.rowCount > 0;
}

module.exports = { checkUserRole };
