const express = require('express');
const router = express.Router();
const { getPapers, getEvents, approvePaperAndSchedule, rejectPaper, manageVolunteer } = require('../controllers/adminController');

// ... existing middleware setup ...

router.get('/papers', getPapers);
router.get('/events', getEvents); // [NEW]
router.post('/approve', approvePaperAndSchedule);
router.post('/reject', rejectPaper);
router.post('/volunteers/status', manageVolunteer); // [NEW]

module.exports = router;
