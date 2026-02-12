const express = require('express');
const { chatWithBot } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, chatWithBot);

module.exports = router;
