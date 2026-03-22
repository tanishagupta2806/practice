const db = require('../db');

// 1. Author requests hostel
const requestHostel = async (req, res) => {
    const { paperId } = req.body;
    const authorId = req.user.id; // From authMiddleware

    try {
        // Ensure the paper belongs to the user and is APPROVED
        const paperCheck = await db.query('SELECT * FROM papers WHERE id = $1 AND author_id = $2 AND status = $3', [paperId, authorId, 'APPROVED']);

        if (paperCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You can only request a hostel for an approved paper you own.' });
        }

        const result = await db.query(
            'INSERT INTO hostel_requests (author_id, paper_id) VALUES ($1, $2) RETURNING *',
            [authorId, paperId]
        );

        res.status(201).json({ message: 'Hostel requested successfully', request: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Hostel already requested for this paper.' });
        }
        console.error('Error requesting hostel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 2. Author viewing their requests
const getMyRequests = async (req, res) => {
    const authorId = req.user.id;

    try {
        const result = await db.query(`
            SELECT hr.*, p.title as paper_title 
            FROM hostel_requests hr
            JOIN papers p ON hr.paper_id = p.id
            WHERE hr.author_id = $1
            ORDER BY hr.created_at DESC
        `, [authorId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching author hostel requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 3. Admin viewing pending requests
const getAllRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT hr.*, u.name as author_name, u.email as author_email, p.title as paper_title
            FROM hostel_requests hr
            JOIN users u ON hr.author_id = u.id
            JOIN papers p ON hr.paper_id = p.id
            ORDER BY hr.created_at ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all hostel requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 4. Admin forwarding to dummy endpoint
const forwardToManagement = async (req, res) => {
    const { requestId } = req.body;

    try {
        // In a real scenario we would make an external HTTP request here
        // const dummyResponse = await axios.post('https://dummy-hostel-api.com/request', { ...data });

        // Since it's a dummy endpoint and always accepts, we just update the DB status directly to APPROVED_BY_HOSTEL
        const result = await db.query(
            "UPDATE hostel_requests SET status = 'APPROVED_BY_HOSTEL' WHERE id = $1 RETURNING *",
            [requestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found.' });
        }

        res.json({ message: 'Request forwarded and approved by Hostel Management', request: result.rows[0] });
    } catch (error) {
        console.error('Error forwarding hostel request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 5. Author submitting stay details
const submitDetails = async (req, res) => {
    const { requestId, startDate, endDate } = req.body;
    const authorId = req.user.id;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

    try {
        const result = await db.query(
            "UPDATE hostel_requests SET hostel_start_date = $1, hostel_end_date = $2, status = 'SUBMITTED_BY_AUTHOR' WHERE id = $3 AND author_id = $4 AND status = 'APPROVED_BY_HOSTEL' RETURNING *",
            [startDate, endDate, requestId, authorId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Request not found, or not ready for details submission.' });
        }

        res.json({ message: 'Hostel stay details submitted successfully', request: result.rows[0] });
    } catch (error) {
        console.error('Error submitting hostel details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    requestHostel,
    getMyRequests,
    getAllRequests,
    forwardToManagement,
    submitDetails
};
