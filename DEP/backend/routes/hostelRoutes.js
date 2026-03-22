const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const {
    requestHostel,
    getMyRequests,
    getAllRequests,
    forwardToManagement,
    submitDetails
} = require('../controllers/hostelController');

// All hostel routes require some form of authentication
router.use(requireAuth);

// Author Routes
router.post('/request', requestHostel);
router.get('/my-requests', getMyRequests);
router.post('/submit-details', submitDetails);

// Admin Routes
router.get('/requests', requireAdmin, getAllRequests);
router.post('/forward', requireAdmin, forwardToManagement);

module.exports = router;
