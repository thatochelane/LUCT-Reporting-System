const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  assignLecturer,
  updateCourse,
  deleteCourse,
} = require('../controllers/coursesController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyRole('pl', 'prl'), getAllCourses);
router.post('/', verifyToken, verifyRole('pl'), createCourse);
router.put('/:id/assign', verifyToken, verifyRole('pl'), assignLecturer);
router.put('/:id', verifyToken, verifyRole('pl'), updateCourse);
router.delete('/:id', verifyToken, verifyRole('pl'), deleteCourse);

module.exports = router;