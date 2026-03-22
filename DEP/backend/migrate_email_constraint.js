const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
    try {
        console.log('--- Starting Migration: Relax Email Constraint ---');

        // 1. Drop existing unique constraint on email
        // We try to drop the default constraint name 'users_email_key'. 
        // If it doesn't exist, we catch the error (or ignore it if using IF EXISTS).
        try {
            await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key");
            console.log('Dropped users_email_key constraint.');
        } catch (e) {
            console.log('Note: users_email_key might not exist or has different name.', e.message);
        }

        // 2. Add composite unique constraint (name, email)
        await pool.query("ALTER TABLE users ADD CONSTRAINT users_name_email_key UNIQUE (name, email)");
        console.log('Added composite unique constraint (name, email).');

        console.log('--- Migration Complete ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
