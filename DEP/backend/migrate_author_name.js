const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
    try {
        console.log('--- Starting Migration: Add author_name to papers ---');

        // 1. Add column
        await pool.query('ALTER TABLE papers ADD COLUMN IF NOT EXISTS author_name VARCHAR(255)');
        console.log('Column author_name added.');

        // 2. Populate column from users table
        await pool.query('UPDATE papers SET author_name = users.name FROM users WHERE papers.author_id = users.id');
        console.log('Existing papers updated with author names from users table.');

        console.log('--- Migration Complete ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
