const express = require('express');
const router = express.Router();
const {
  createRating,
  getLecturerRatings,
  getMyRatings,
  getAllRatings,
  updateRating,
  deleteRating,
} = require('../controllers/ratingController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { db } = require('../config/firebase');

// Student routes
router.post('/', verifyToken, verifyRole('student'), createRating);
router.put('/:id', verifyToken, verifyRole('student'), updateRating);

// Student submitted ratings
router.get('/my-submitted', verifyToken, verifyRole('student'), async (req, res) => {
  try {
    const { search } = req.query;

    const snapshot = await db
      .collection('ratings')
      .where('studentUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    let ratings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      ratings = ratings.filter(r =>
        r.lecturerName.toLowerCase().includes(searchLower) ||
        r.courseName.toLowerCase().includes(searchLower) ||
        r.courseCode.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lecturer routes
router.get('/my-ratings', verifyToken, verifyRole('lecturer'), getMyRatings);
router.get('/lecturer/:lecturerUid', verifyToken, getLecturerRatings);

// PRL routes
router.get('/', verifyToken, verifyRole('prl'), getAllRatings);

// Shared
router.delete('/:id', verifyToken, verifyRole('student', 'prl'), deleteRating);

module.exports = router;