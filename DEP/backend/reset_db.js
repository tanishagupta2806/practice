const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const resetDb = async () => {
    try {
        console.log('--- Resetting Database ---');

        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('Database wiped and schema recreated.');

    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

resetDb();
