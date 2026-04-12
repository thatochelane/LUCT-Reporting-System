import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyReports } from '../../api/index';

const LecturerMonitoringScreen = ({ user }) => {
  const [totalReports, setTotalReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [reviewedReports, setReviewedReports] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getMyReports();
      if (response.reports) {
        const reports = response.reports;
        setTotalReports(reports.length);
        setPendingReports(reports.filter(r => r.status === 'pending').length);
        setReviewedReports(reports.filter(r => r.status === 'reviewed').length);

        // Average attendance
        if (reports.length > 0) {
          const totalPresent = reports.reduce((sum, r) => sum + Number(r.actualStudentsPresent || 0), 0);
          const totalRegistered = reports.reduce((sum, r) => sum + Number(r.totalRegisteredStudents || 0), 0);
          const avg = totalRegistered > 0 ? Math.round((totalPresent / totalRegistered) * 100) : 0;
          setAvgAttendance(avg);
        }

        // Build courses breakdown
        const coursesMap = {};
        reports.forEach(r => {
          if (!coursesMap[r.courseCode]) {
            coursesMap[r.courseCode] = {
              courseCode: r.courseCode,
              courseName: r.courseName,
              reportCount: 0,
              totalPresent: 0,
              totalRegistered: 0,
            };
          }
          coursesMap[r.courseCode].reportCount++;
          coursesMap[r.courseCode].totalPresent += Number(r.actualStudentsPresent || 0);
          coursesMap[r.courseCode].totalRegistered += Number(r.totalRegisteredStudents || 0);
        });

        const list = Object.values(coursesMap).map(c => ({
          ...c,
          avgAttendance: c.totalRegistered > 0
            ? Math.round((c.totalPresent / c.totalRegistered) * 100)
            : 0,
        }));
        setCoursesList(list);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Reports', value: loading ? '...' : String(totalReports), icon: 'document-text-outline' },
    { label: 'Pending Review', value: loading ? '...' : String(pendingReports), icon: 'hourglass-outline' },
    { label: 'Reviewed', value: loading ? '...' : String(reviewedReports), icon: 'checkmark-circle-outline' },
    { label: 'Avg Attendance', value: loading ? '...' : `${avgAttendance}%`, icon: 'people-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="stats-chart-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Monitoring</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color="#a78bfa" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Courses Breakdown */}
        <Text style={styles.sectionTitle}>Courses Breakdown</Text>
        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 20 }} />
        ) : coursesList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="stats-chart-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>Submit reports to see monitoring data</Text>
          </View>
        ) : (
          coursesList.map((course, index) => (
            <View key={index} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View>
                  <Text style={styles.courseName}>{course.courseName}</Text>
                  <Text style={styles.courseCode}>{course.courseCode}</Text>
                </View>
                <View style={[
                  styles.attendanceBadge,
                  { backgroundColor: course.avgAttendance >= 75 ? '#16a34a22' : '#dc262622' }
                ]}>
                  <Text style={[
                    styles.attendanceText,
                    { color: course.avgAttendance >= 75 ? '#16a34a' : '#dc2626' }
                  ]}>
                    {course.avgAttendance}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${course.avgAttendance}%`,
                    backgroundColor: course.avgAttendance >= 75 ? '#16a34a' : '#dc2626',
                  }
                ]} />
              </View>

              <View style={styles.courseStats}>
                <Text style={styles.courseStat}>{course.reportCount} reports</Text>
                <Text style={styles.courseStat}>{course.totalPresent}/{course.totalRegistered} students</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a0533' },
  container: { flex: 1, backgroundColor: '#1a0533', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%',
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#a78bfa' },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 14 },
  emptyCard: {
    backgroundColor: '#12022e',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptySubtitle: { fontSize: 13, color: '#666', textAlign: 'center' },
  courseCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 12,
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  courseCode: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  attendanceText: { fontSize: 13, fontWeight: '700' },
  progressBar: {
    height: 6,
    backgroundColor: '#1a0533',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseStat: { fontSize: 12, color: '#888' },
  bottomSpacing: { height: 30 },
});

export default LecturerMonitoringScreen;