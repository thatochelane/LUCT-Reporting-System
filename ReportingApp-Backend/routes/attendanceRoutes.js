const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByCourse,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Student routes
router.get('/my-attendance', verifyToken, verifyRole('student'), getMyAttendance);

// Lecturer routes
router.post('/', verifyToken, verifyRole('lecturer'), markAttendance);
router.get('/course/:courseCode', verifyToken, verifyRole('lecturer', 'prl'), getAttendanceByCourse);
router.put('/:id', verifyToken, verifyRole('lecturer'), updateAttendance);
router.delete('/:id', verifyToken, verifyRole('lecturer', 'prl'), deleteAttendance);

// PRL routes
router.get('/', verifyToken, verifyRole('prl', 'pl'), getAllAttendance);

module.exports = router;