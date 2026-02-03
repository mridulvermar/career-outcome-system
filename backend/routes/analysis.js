const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createAnalysis,
  getAnalysisHistory,
  getAnalysisById,
  compareCareers,
  deleteAnalysis
} = require('../controllers/analysisController');
const { generateReport } = require('../controllers/reportController');

// Analysis routes
router.route('/')
  .post(protect, createAnalysis)
  .get(protect, getAnalysisHistory);

router.route('/compare')
  .post(protect, compareCareers);

router.route('/:id')
  .get(protect, getAnalysisById)
  .delete(protect, deleteAnalysis);

router.route('/:id/report')
  .get(protect, generateReport);

module.exports = router;
