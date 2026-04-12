const { db } = require('../config/firebase');

// Create a rating
const createRating = async (req, res) => {
  try {
    const {
      lecturerUid,
      lecturerName,
      courseCode,
      courseName,
      rating,
      comment,
    } = req.body;

    if (!lecturerUid || !lecturerName || !courseCode || !courseName || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if student already rated this lecturer for this course
    const existingRating = await db
      .collection('ratings')
      .where('studentUid', '==', req.user.uid)
      .where('courseCode', '==', courseCode)
      .where('lecturerUid', '==', lecturerUid)
      .get();

    if (!existingRating.empty) {
      return res.status(400).json({
        message: 'You have already rated this lecturer for this course',
      });
    }

    const ratingData = {
      lecturerUid,
      lecturerName,
      courseCode,
      courseName,
      rating: Number(rating),
      comment: comment || '',
      studentUid: req.user.uid,
      studentName: req.user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ratingRef = await db.collection('ratings').add(ratingData);

    res.status(201).json({
      message: 'Rating submitted successfully',
      ratingId: ratingRef.id,
      rating: { id: ratingRef.id, ...ratingData },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ratings for a lecturer
const getLecturerRatings = async (req, res) => {
  try {
    const { lecturerUid } = req.params;
    const { search } = req.query;

    const snapshot = await db
      .collection('ratings')
      .where('lecturerUid', '==', lecturerUid)
      .orderBy('createdAt', 'desc')
      .get();

    let ratings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      ratings = ratings.filter(
        (r) =>
          r.courseName.toLowerCase().includes(searchLower) ||
          r.courseCode.toLowerCase().includes(searchLower) ||
          r.comment.toLowerCase().includes(searchLower)
      );
    }

    // Calculate average rating
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.status(200).json({
      ratings,
      averageRating: averageRating.toFixed(1),
      totalRatings: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my ratings as a lecturer
const getMyRatings = async (req, res) => {
  try {
    const { search } = req.query;

    const snapshot = await db
      .collection('ratings')
      .where('lecturerUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    let ratings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      ratings = ratings.filter(
        (r) =>
          r.courseName.toLowerCase().includes(searchLower) ||
          r.courseCode.toLowerCase().includes(searchLower) ||
          r.studentName.toLowerCase().includes(searchLower)
      );
    }

    // Calculate average rating
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.status(200).json({
      ratings,
      averageRating: averageRating.toFixed(1),
      totalRatings: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all ratings (PRL)
const getAllRatings = async (req, res) => {
  try {
    const { search } = req.query;

    const snapshot = await db
      .collection('ratings')
      .orderBy('createdAt', 'desc')
      .get();

    let ratings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      ratings = ratings.filter(
        (r) =>
          r.lecturerName.toLowerCase().includes(searchLower) ||
          r.courseName.toLowerCase().includes(searchLower) ||
          r.courseCode.toLowerCase().includes(searchLower) ||
          r.studentName.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update rating
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const ratingDoc = await db.collection('ratings').doc(id).get();

    if (!ratingDoc.exists) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Only the student who created it can update
    if (ratingDoc.data().studentUid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await db.collection('ratings').doc(id).update({
      rating: Number(rating),
      comment: comment || '',
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Rating updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete rating
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const ratingDoc = await db.collection('ratings').doc(id).get();

    if (!ratingDoc.exists) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    await db.collection('ratings').doc(id).delete();

    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRating,
  getLecturerRatings,
  getMyRatings,
  getAllRatings,
  updateRating,
  deleteRating,
};