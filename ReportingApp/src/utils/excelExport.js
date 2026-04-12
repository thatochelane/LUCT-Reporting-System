import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Export Reports to Excel
export const exportReportsToExcel = async (reports) => {
  try {
    const data = reports.map((r, index) => ({
      'No.': index + 1,
      'Faculty Name': r.facultyName,
      'Class Name': r.className,
      'Week': r.weekOfReporting,
      'Date': r.dateOfLecture,
      'Course Name': r.courseName,
      'Course Code': r.courseCode,
      'Lecturer Name': r.lecturerName,
      'Students Present': r.actualStudentsPresent,
      'Total Registered': r.totalRegisteredStudents,
      'Venue': r.venue,
      'Scheduled Time': r.scheduledLectureTime,
      'Topic Taught': r.topicTaught,
      'Learning Outcomes': r.learningOutcomes,
      'Recommendations': r.recommendations,
      'Status': r.status,
      'Feedback': r.feedback || 'N/A',
      'Date Submitted': new Date(r.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No.
      { wch: 20 },  // Faculty Name
      { wch: 20 },  // Class Name
      { wch: 10 },  // Week
      { wch: 15 },  // Date
      { wch: 25 },  // Course Name
      { wch: 15 },  // Course Code
      { wch: 20 },  // Lecturer Name
      { wch: 18 },  // Students Present
      { wch: 18 },  // Total Registered
      { wch: 15 },  // Venue
      { wch: 18 },  // Scheduled Time
      { wch: 30 },  // Topic Taught
      { wch: 35 },  // Learning Outcomes
      { wch: 30 },  // Recommendations
      { wch: 12 },  // Status
      { wch: 30 },  // Feedback
      { wch: 18 },  // Date Submitted
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `LUCT_Reports_${new Date().toISOString().split('T')[0]}.xlsx`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: 'base64',
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Download LUCT Reports',
      UTI: 'com.microsoft.excel.xlsx',
    });

    return { success: true };
  } catch (error) {
    console.log('Export error:', error);
    return { success: false, error: error.message };
  }
};

// Export Attendance to Excel
export const exportAttendanceToExcel = async (attendance) => {
  try {
    const data = attendance.map((a, index) => ({
      'No.': index + 1,
      'Student Name': a.studentName,
      'Student ID': a.studentId,
      'Course Name': a.courseName,
      'Course Code': a.courseCode,
      'Class Name': a.className,
      'Date': a.date,
      'Status': a.status.charAt(0).toUpperCase() + a.status.slice(1),
      'Marked By': a.markedBy,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `LUCT_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: 'base64',
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Download Attendance',
      UTI: 'com.microsoft.excel.xlsx',
    });

    return { success: true };
  } catch (error) {
    console.log('Export error:', error);
    return { success: false, error: error.message };
  }
};

// Export Ratings to Excel
export const exportRatingsToExcel = async (ratings) => {
  try {
    const data = ratings.map((r, index) => ({
      'No.': index + 1,
      'Lecturer Name': r.lecturerName,
      'Course Name': r.courseName,
      'Course Code': r.courseCode,
      'Rating': r.rating,
      'Comment': r.comment || 'N/A',
      'Student Name': r.studentName,
      'Date': new Date(r.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ratings');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `LUCT_Ratings_${new Date().toISOString().split('T')[0]}.xlsx`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: 'base64',
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Download Ratings',
      UTI: 'com.microsoft.excel.xlsx',
    });

    return { success: true };
  } catch (error) {
    console.log('Export error:', error);
    return { success: false, error: error.message };
  }
};