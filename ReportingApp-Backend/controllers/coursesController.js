const { db } = require('../config/firebase');

// Create a course
const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseCode,
      facultyName,
      lecturerUid,
      lecturerName,
      className,
      semester,
      year,
    } = req.body;

    if (!courseName || !courseCode || !facultyName) {
      return res.status(400).json({ message: 'Course name, code and faculty are required' });
    }

    const courseData = {
      courseName,
      courseCode,
      facultyName,
      lecturerUid: lecturerUid || '',
      lecturerName: lecturerName || '',
      className: className || '',
      semester: semester || '',
      year: year || '',
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const courseRef = await db.collection('courses').add(courseData);

    res.status(201).json({
      message: 'Course created successfully',
      courseId: courseRef.id,
      course: { id: courseRef.id, ...courseData },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;
    const snapshot = await db
      .collection('courses')
      .orderBy('createdAt', 'desc')
      .get();

    let courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(c =>
        c.courseName.toLowerCase().includes(searchLower) ||
        c.courseCode.toLowerCase().includes(searchLower) ||
        c.facultyName.toLowerCase().includes(searchLower) ||
        c.lecturerName.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign lecturer to course
const assignLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { lecturerUid, lecturerName } = req.body;

    const courseDoc = await db.collection('courses').doc(id).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.collection('courses').doc(id).update({
      lecturerUid,
      lecturerName,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Lecturer assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDoc = await db.collection('courses').doc(id).get();

    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.collection('courses').doc(id).update({
      ...req.body,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDoc = await db.collection('courses').doc(id).get();

    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.collection('courses').doc(id).delete();
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  assignLecturer,
  updateCourse,
  deleteCourse,
};