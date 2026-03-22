const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
    try {
        console.log('--- Starting Migration: Add status to volunteer_registrations ---');

        // 1. Add column
        await pool.query("ALTER TABLE volunteer_registrations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))");
        console.log('Column status added.');

        // 2. Default existing to APPROVED (optional, but good for backward compatibility if desired, or leave PENDING)
        // Let's leave them as PENDING or set to APPROVED if you want existing ones to be auto-approved.
        // Given the request "separate approve mechanism", let's leave them as PENDING (default) or update to APPROVED.
        // I'll update existing ones to APPROVED to avoid disrupting current flow.
        await pool.query("UPDATE volunteer_registrations SET status = 'APPROVED' WHERE status IS NULL");
        console.log('Existing registrations updated to APPROVED.');

        console.log('--- Migration Complete ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
