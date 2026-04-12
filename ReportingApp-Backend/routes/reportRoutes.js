const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReport,
  addFeedback,
  deleteReport,
} = require('../controllers/reportController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Lecturer routes
router.post('/', verifyToken, verifyRole('lecturer'), createReport);
router.get('/my-reports', verifyToken, verifyRole('lecturer'), getMyReports);
router.put('/:id', verifyToken, verifyRole('lecturer'), updateReport);
router.delete('/:id', verifyToken, verifyRole('lecturer', 'prl'), deleteReport);

// Shared routes
router.get('/:id', verifyToken, getReportById);

// PRL routes
router.get('/', verifyToken, verifyRole('prl'), getAllReports);
router.put('/:id/feedback', verifyToken, verifyRole('prl'), addFeedback);

module.exports = router;