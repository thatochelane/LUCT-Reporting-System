const { db } = require('../config/firebase');

// Create a new report
const createReport = async (req, res) => {
  try {
    const {
      facultyName,
      className,
      weekOfReporting,
      dateOfLecture,
      courseName,
      courseCode,
      lecturerName,
      actualStudentsPresent,
      totalRegisteredStudents,
      venue,
      scheduledLectureTime,
      topicTaught,
      learningOutcomes,
      recommendations,
    } = req.body;

    // Validate required fields
    if (
      !facultyName ||
      !className ||
      !weekOfReporting ||
      !dateOfLecture ||
      !courseName ||
      !courseCode ||
      !lecturerName ||
      !actualStudentsPresent ||
      !totalRegisteredStudents ||
      !venue ||
      !scheduledLectureTime ||
      !topicTaught ||
      !learningOutcomes ||
      !recommendations
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const reportData = {
      facultyName,
      className,
      weekOfReporting,
      dateOfLecture,
      courseName,
      courseCode,
      lecturerName,
      actualStudentsPresent: Number(actualStudentsPresent),
      totalRegisteredStudents: Number(totalRegisteredStudents),
      venue,
      scheduledLectureTime,
      topicTaught,
      learningOutcomes,
      recommendations,
      lecturerUid: req.user.uid,
      status: 'pending',
      feedback: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reportRef = await db.collection('reports').add(reportData);

    res.status(201).json({
      message: 'Report created successfully',
      reportId: reportRef.id,
      report: { id: reportRef.id, ...reportData },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports (for PRL)
const getAllReports = async (req, res) => {
  try {
    const { search } = req.query;
    let reportsRef = db.collection('reports').orderBy('createdAt', 'desc');
    const snapshot = await reportsRef.get();

    let reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.courseName.toLowerCase().includes(searchLower) ||
          r.lecturerName.toLowerCase().includes(searchLower) ||
          r.className.toLowerCase().includes(searchLower) ||
          r.courseCode.toLowerCase().includes(searchLower) ||
          r.facultyName.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports by lecturer
const getMyReports = async (req, res) => {
  try {
    const { search } = req.query;
    const snapshot = await db
      .collection('reports')
      .where('lecturerUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    let reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.courseName.toLowerCase().includes(searchLower) ||
          r.className.toLowerCase().includes(searchLower) ||
          r.courseCode.toLowerCase().includes(searchLower) ||
          r.topicTaught.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const reportDoc = await db.collection('reports').doc(id).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      report: { id: reportDoc.id, ...reportDoc.data() },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportDoc = await db.collection('reports').doc(id).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only the lecturer who created it can update
    if (reportDoc.data().lecturerUid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('reports').doc(id).update(updatedData);

    res.status(200).json({ message: 'Report updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add feedback to report (PRL only)
const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const reportDoc = await db.collection('reports').doc(id).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await db.collection('reports').doc(id).update({
      feedback,
      status: 'reviewed',
      reviewedBy: req.user.uid,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Feedback added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportDoc = await db.collection('reports').doc(id).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await db.collection('reports').doc(id).delete();

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReport,
  addFeedback,
  deleteReport,
};