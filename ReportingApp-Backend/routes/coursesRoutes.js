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

// Get courses assigned to a lecturer
router.get('/my-courses', verifyToken, verifyRole('lecturer'), async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const snapshot = await db
      .collection('courses')
      .where('lecturerUid', '==', req.user.uid)
      .get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;