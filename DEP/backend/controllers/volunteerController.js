// controllers/volunteerController.js
const db = require('../db');

// GET /api/volunteers/events
const getAvailableEvents = async (req, res) => {
    try {
        const query = `
            SELECT e.id AS event_id, e.event_date, e.location, 
                   p.title AS paper_title, 
                   p.author_name 
            FROM events e
            JOIN papers p ON e.paper_id = p.id
            ORDER BY e.event_date ASC;
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/volunteers/register
const registerVolunteer = async (req, res) => {
    const { name, email, eventId } = req.body;

    try {
        // 1. Check if user exists (by email AND name)
        const checkUser = await db.query('SELECT id FROM users WHERE email = $1 AND name = $2', [email, name]);
        let volunteerId;

        if (checkUser.rows.length > 0) {
            volunteerId = checkUser.rows[0].id;
        } else {
            const userQuery = `
                INSERT INTO users (name, email, password_hash, role) 
                VALUES ($1, $2, $3, 'VOLUNTEER') 
                RETURNING id;
            `;
            // Dummy password hash since auth isn't implemented yet
            const userValues = [name, email, 'dummy_hash_for_now'];
            const userResult = await db.query(userQuery, userValues);
            volunteerId = userResult.rows[0].id;
        }

        // 2. Register the Volunteer for the Event
        const registerQuery = `
            INSERT INTO volunteer_registrations (volunteer_id, event_id) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const registerResult = await db.query(registerQuery, [volunteerId, eventId]);

        res.status(201).json({
            message: 'Successfully registered to volunteer for the event!',
            registration: registerResult.rows[0]
        });

    } catch (error) {
        // Handle the UNIQUE constraint violation if they already registered for this event
        if (error.code === '23505') {
            return res.status(409).json({ error: 'You are already registered for this event.' });
        }
        console.error('Error registering volunteer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAvailableEvents, registerVolunteer };
