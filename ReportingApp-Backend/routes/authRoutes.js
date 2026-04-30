const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { db } = require('../config/firebase');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);

// Get all lecturers
router.get('/lecturers', verifyToken, verifyRole('pl', 'prl'), async (req, res) => {
  try {
    const snapshot = await db
      .collection('users')
      .where('role', '==', 'lecturer')
      .get();

    const lecturers = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ lecturers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;