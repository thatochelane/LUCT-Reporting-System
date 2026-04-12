const { db } = require('../config/firebase');

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      courseCode,
      courseName,
      className,
      date,
      status,
      lecturerUid,
    } = req.body;

    if (
      !studentId ||
      !studentName ||
      !courseCode ||
      !courseName ||
      !className ||
      !date ||
      !status
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const attendanceData = {
      studentId,
      studentName,
      courseCode,
      courseName,
      className,
      date,
      status, // 'present', 'absent', 'late'
      lecturerUid: lecturerUid || req.user.uid,
      markedBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const attendanceRef = await db
      .collection('attendance')
      .add(attendanceData);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendanceId: attendanceRef.id,
      attendance: { id: attendanceRef.id, ...attendanceData },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by course (lecturer)
const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { search } = req.query;

    const snapshot = await db
      .collection('attendance')
      .where('courseCode', '==', courseCode)
      .orderBy('createdAt', 'desc')
      .get();

    let attendance = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      attendance = attendance.filter(
        (a) =>
          a.studentName.toLowerCase().includes(searchLower) ||
          a.studentId.toLowerCase().includes(searchLower) ||
          a.className.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by student
const getMyAttendance = async (req, res) => {
  try {
    const { search } = req.query;

    // Get user data to find their studentId
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    // Query by uid OR studentId
    const snapshotByUid = await db
      .collection('attendance')
      .where('studentId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const snapshotByStudentId = await db
      .collection('attendance')
      .where('studentId', '==', userData.studentId || '')
      .orderBy('createdAt', 'desc')
      .get();

    // Merge both results and remove duplicates
    const allDocs = new Map();
    snapshotByUid.docs.forEach(doc => allDocs.set(doc.id, { id: doc.id, ...doc.data() }));
    snapshotByStudentId.docs.forEach(doc => allDocs.set(doc.id, { id: doc.id, ...doc.data() }));

    let attendance = Array.from(allDocs.values());

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      attendance = attendance.filter(
        (a) =>
          a.courseName.toLowerCase().includes(searchLower) ||
          a.courseCode.toLowerCase().includes(searchLower) ||
          a.className.toLowerCase().includes(searchLower)
      );
    }

    // Calculate attendance summary per course
    const summary = {};
    attendance.forEach((record) => {
      if (!summary[record.courseCode]) {
        summary[record.courseCode] = {
          courseCode: record.courseCode,
          courseName: record.courseName,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      summary[record.courseCode].total++;
      summary[record.courseCode][record.status]++;
    });

    res.status(200).json({
      attendance,
      summary: Object.values(summary),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance (PRL)
const getAllAttendance = async (req, res) => {
  try {
    const { search } = req.query;

    const snapshot = await db
      .collection('attendance')
      .orderBy('createdAt', 'desc')
      .get();

    let attendance = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      attendance = attendance.filter(
        (a) =>
          a.studentName.toLowerCase().includes(searchLower) ||
          a.courseCode.toLowerCase().includes(searchLower) ||
          a.courseName.toLowerCase().includes(searchLower) ||
          a.className.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const attendanceDoc = await db.collection('attendance').doc(id).get();

    if (!attendanceDoc.exists) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await db.collection('attendance').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendanceDoc = await db.collection('attendance').doc(id).get();

    if (!attendanceDoc.exists) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await db.collection('attendance').doc(id).delete();

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByCourse,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
};