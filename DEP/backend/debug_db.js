const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const debugUsers = async () => {
    try {
        console.log('--- Debugging Users Table ---');
        const res = await pool.query('SELECT * FROM users');

        if (res.rows.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log(`Found ${res.rows.length} users:`);
            console.table(res.rows);
        }

        console.log('\n--- Debugging Papers Table ---');
        const paperRes = await pool.query('SELECT * FROM papers');
        if (paperRes.rows.length === 0) {
            console.log('No papers found.');
        } else {
            console.table(paperRes.rows);
        }

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
};

debugUsers();
