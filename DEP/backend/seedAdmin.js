const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seedAdmin = async () => {
    const adminEmail = 'admin@conference.com';
    const adminPassword = 'admin123'; // In a real app, use a strong password
    const adminName = 'Conference Admin';

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Check if admin already exists
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const checkResult = await pool.query(checkQuery, [adminEmail]);

        if (checkResult.rows.length > 0) {
            console.log('Admin user already exists.');
        } else {
            // Insert new admin
            const insertQuery = `
                INSERT INTO users (name, email, password_hash, role)
                VALUES ($1, $2, $3, 'ADMIN')
                RETURNING id, name, email;
            `;
            const insertResult = await pool.query(insertQuery, [adminName, adminEmail, hashedPassword]);
            console.log('Admin user created successfully:', insertResult.rows[0]);
        }

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await pool.end();
    }
};

seedAdmin();
