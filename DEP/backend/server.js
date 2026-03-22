// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const volunteerRoutes = require('./routes/volunteerRoutes');

// Import Routes
const submissionRoutes = require('./routes/submissionRoutes');

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); // [NEW]
const { requireAdmin } = require('./middlewares/authMiddleware'); // [NEW]

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the uploads folder statically so files can be accessed later
app.use('/uploads', express.static('uploads'));

// Mount Routes
app.use('/api/auth', authRoutes); // Public
app.use('/api/submissions', submissionRoutes);
app.use('/api/volunteers', volunteerRoutes);
const hostelRoutes = require('./routes/hostelRoutes'); // [NEW]
app.use('/api/hostel', hostelRoutes); // [NEW]

app.use('/api/admin', requireAdmin, adminRoutes); // [PROTECTED]
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
