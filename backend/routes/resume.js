const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/resume/parse
// Desc: Upload and parse a resume PDF
// Access: Private (or Public depending on requirements, let's keep it private for logged in users)
router.post('/parse', auth.protect, upload.single('resume'), resumeController.parseResume);

module.exports = router;
