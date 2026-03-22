const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['AUTHOR', 'VOLUNTEER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Choose AUTHOR or VOLUNTEER.' });
    }

    try {
        // Check if email exists
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );

        const newUser = result.rows[0];

        // Generate token
        const secret = process.env.JWT_SECRET || 'super_secret_key_123';
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, email: newUser.email },
            secret,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user(s) exist
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const users = result.rows;

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Find the user with the matching password
        let authenticatedUser = null;

        for (const user of users) {
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                // If we find a match, check if we already have one.
                // Prioritize ADMIN if multiple matches found.
                if (!authenticatedUser || user.role === 'ADMIN') {
                    authenticatedUser = user;
                }
            }
        }

        if (!authenticatedUser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = authenticatedUser;

        // 3. Check role (optional, but good for admin login)
        // If they are logging into the admin panel, we might want to enforce ADMIN role here?
        // But this is a generic login. Let the frontend handle redirection based on role.
        // However, if the user specifically requested Admin access (e.g. via separate endpoint), we'd filter.
        // For now, we return the user found.

        // 4. Generate Token
        // Needs a JWT_SECRET in .env, defaulting to a secret here for demo simplicity if missing
        const secret = process.env.JWT_SECRET || 'super_secret_key_123';
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            secret,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login, register };
