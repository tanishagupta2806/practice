const db = require('../db');

const getPapers = async (req, res) => {
    // ... existing getPapers code ...
    const status = req.query.status || 'PENDING';
    try {
        const result = await db.query(`
            SELECT p.id, p.title, p.file_url, p.status, p.submitted_at,
                   p.author_name, u.email AS author_email
            FROM papers p
            JOIN users u ON p.author_id = u.id
            WHERE p.status = $1
            ORDER BY p.submitted_at ASC
        `, [status]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/admin/events
const getEvents = async (req, res) => {
    try {
        // Fetch events with paper/author info AND aggregated volunteers
        const query = `
            SELECT 
                e.id, e.event_date, e.location,
                p.title AS paper_title, p.author_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', vr.id,
                            'volunteer_id', u.id,
                            'name', u.name,
                            'email', u.email,
                            'status', vr.status
                        ) 
                    ) FILTER (WHERE vr.id IS NOT NULL), 
                    '[]'
                ) AS volunteers
            FROM events e
            JOIN papers p ON e.paper_id = p.id
            LEFT JOIN volunteer_registrations vr ON e.id = vr.event_id
            LEFT JOIN users u ON vr.volunteer_id = u.id
            GROUP BY e.id, p.title, p.author_name
            ORDER BY e.event_date ASC;
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const approvePaperAndSchedule = async (req, res) => {
    const { paperId, eventDate, location, force } = req.body;

    if (!paperId || !eventDate || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await db.connect();

    try {
        // 0. Check Collision (unless forced)
        if (!force) {
            const collisionCheck = await client.query(
                "SELECT * FROM events WHERE event_date = $1",
                [eventDate]
            );
            if (collisionCheck.rows.length > 0) {
                return res.status(409).json({
                    error: 'Collision detected',
                    message: 'Another event is already scheduled at this time. Confirm to proceed?',
                    collision: true
                });
            }
        }

        await client.query('BEGIN');

        // 1. Update Paper Status
        const updatePaper = await client.query(
            "UPDATE papers SET status = 'APPROVED' WHERE id = $1 RETURNING title, author_id",
            [paperId]
        );

        if (updatePaper.rows.length === 0) {
            throw new Error('Paper not found');
        }

        // 2. Create Event
        await client.query(
            'INSERT INTO events (paper_id, event_date, location) VALUES ($1, $2, $3)',
            [paperId, eventDate, location]
        );

        await client.query('COMMIT');
        res.json({ message: 'Paper approved and event scheduled' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error approving paper:', error);
        res.status(500).json({ error: 'Transaction failed' });
    } finally {
        client.release();
    }
};

const rejectPaper = async (req, res) => {
    const { paperId } = req.body;
    // ... existing rejectPaper code ...
    if (!paperId) {
        return res.status(400).json({ error: 'Paper ID is required' });
    }
    try {
        const result = await db.query(
            "UPDATE papers SET status = 'REJECTED' WHERE id = $1 RETURNING title",
            [paperId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        res.json({ message: `Paper "${result.rows[0].title}" rejected.` });
    } catch (error) {
        console.error('Error rejecting paper:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/admin/volunteers/status
const manageVolunteer = async (req, res) => {
    const { registrationId, status } = req.body; // status: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const result = await db.query(
            "UPDATE volunteer_registrations SET status = $1 WHERE id = $2 RETURNING *",
            [status, registrationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        res.json({ message: `Volunteer status updated to ${status}` });
    } catch (error) {
        console.error('Error updating volunteer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getPapers, getEvents, approvePaperAndSchedule, rejectPaper, manageVolunteer };
