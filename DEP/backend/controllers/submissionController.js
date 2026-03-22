const db = require('../db');

const submitPaper = async (req, res) => {
    const { name, email, title } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Paper file is required' });
    }

    try {
        let userId;

        // If the route is protected, we should use req.user.id
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else {
            // Fallback for unauthenticated requests (if any remain)
            let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

            if (userResult.rows.length > 0) {
                userId = userResult.rows[0].id;
            } else {
                const newUser = await db.query(
                    'INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
                    [name, email, 'AUTHOR', 'auth_pending']
                );
                userId = newUser.rows[0].id;
                console.log('New Author Created:', { id: userId, name, email });
            }
        }

        // 2. Insert Paper
        const paperResult = await db.query(
            'INSERT INTO papers (title, author_id, author_name, file_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, userId, name, file.path]
        );

        console.log('Paper Submitted:', paperResult.rows[0]); // Log for debugging

        res.status(201).json({ message: 'Paper submitted successfully', paper: paperResult.rows[0] });

    } catch (error) {
        console.error('Error submitting paper:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMyPapers = async (req, res) => {
    const authorId = req.user.id;

    try {
        const result = await db.query(
            'SELECT * FROM papers WHERE author_id = $1 ORDER BY submitted_at DESC',
            [authorId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching author papers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitPaper, getMyPapers };
