// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { requireAuth } = require('../middlewares/authMiddleware');
const { submitPaper, getMyPapers } = require('../controllers/submissionController');

router.get('/my-papers', requireAuth, getMyPapers);

// The 'paperFile' string is the name attribute of the file input in your frontend form
router.post('/', requireAuth, upload.single('paperFile'), submitPaper);

module.exports = router;
