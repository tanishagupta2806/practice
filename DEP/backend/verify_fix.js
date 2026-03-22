const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const verifyAuthorNames = async () => {
    try {
        console.log('--- Verifying Author Names in Papers Table ---');
        const res = await pool.query('SELECT id, title, author_name, author_id FROM papers ORDER BY id DESC LIMIT 5');

        if (res.rows.length === 0) {
            console.log('No papers found.');
        } else {
            console.table(res.rows);
        }

        console.log('\n--- Checking Users Table (Should share ID but have latest name) ---');
        const userRes = await pool.query('SELECT id, name, email FROM users WHERE id IN (SELECT author_id FROM papers ORDER BY id DESC LIMIT 5)');
        console.table(userRes.rows);

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
};

verifyAuthorNames();
