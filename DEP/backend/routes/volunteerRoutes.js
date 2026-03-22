// routes/volunteerRoutes.js
const express = require('express');
const router = express.Router();
const { getAvailableEvents, registerVolunteer } = require('../controllers/volunteerController');

router.get('/events', getAvailableEvents);
router.post('/register', registerVolunteer);

module.exports = router;
