import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports, getAllRatings } from '../../api/index';

const PLMonitoringScreen = ({ user }) => {
  const [totalReports, setTotalReports] = useState(0);
  const [totalLecturers, setTotalLecturers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [avgRating, setAvgRating] = useState('0.0');
  const [lecturersList, setLecturersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const reportsRes = await getAllReports();
      if (reportsRes.reports) {
        const reports = reportsRes.reports;
        setTotalReports(reports.length);

        const uniqueLecturers = [...new Set(reports.map(r => r.lecturerUid))];
        setTotalLecturers(uniqueLecturers.length);

        const uniqueCourses = [...new Set(reports.map(r => r.courseCode))];
        setTotalCourses(uniqueCourses.length);

        // Average attendance
        if (reports.length > 0) {
          const totalPresent = reports.reduce((sum, r) => sum + Number(r.actualStudentsPresent || 0), 0);
          const totalRegistered = reports.reduce((sum, r) => sum + Number(r.totalRegisteredStudents || 0), 0);
          const avg = totalRegistered > 0 ? Math.round((totalPresent / totalRegistered) * 100) : 0;
          setAvgAttendance(avg);
        }

        // Build lecturers list
        const lecturersMap = {};
        reports.forEach(r => {
          if (!lecturersMap[r.lecturerUid]) {
            lecturersMap[r.lecturerUid] = {
              uid: r.lecturerUid,
              name: r.lecturerName,
              reportCount: 0,
              reviewedCount: 0,
              totalPresent: 0,
              totalRegistered: 0,
            };
          }
          lecturersMap[r.lecturerUid].reportCount++;
          if (r.status === 'reviewed') lecturersMap[r.lecturerUid].reviewedCount++;
          lecturersMap[r.lecturerUid].totalPresent += Number(r.actualStudentsPresent || 0);
          lecturersMap[r.lecturerUid].totalRegistered += Number(r.totalRegisteredStudents || 0);
        });

        const list = Object.values(lecturersMap).map(l => ({
          ...l,
          avgAttendance: l.totalRegistered > 0
            ? Math.round((l.totalPresent / l.totalRegistered) * 100)
            : 0,
        }));
        setLecturersList(list);
      }

      const ratingsRes = await getAllRatings();
      if (ratingsRes.ratings && ratingsRes.ratings.length > 0) {
        const avg = ratingsRes.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsRes.ratings.length;
        setAvgRating(avg.toFixed(1));
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Reports', value: loading ? '...' : String(totalReports), icon: 'document-text-outline' },
    { label: 'Total Lecturers', value: loading ? '...' : String(totalLecturers), icon: 'people-outline' },
    { label: 'Total Courses', value: loading ? '...' : String(totalCourses), icon: 'library-outline' },
    { label: 'Avg Attendance', value: loading ? '...' : `${avgAttendance}%`, icon: 'stats-chart-outline' },
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

        {/* Average Rating Card */}
        <View style={styles.ratingCard}>
          <Ionicons name="star" size={28} color="#f59e0b" />
          <View style={styles.ratingInfo}>
            <Text style={styles.ratingValue}>{avgRating}</Text>
            <Text style={styles.ratingLabel}>Average Lecturer Rating</Text>
          </View>
        </View>

        {/* Lecturers Overview */}
        <Text style={styles.sectionTitle}>Lecturers Overview</Text>
        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 20 }} />
        ) : lecturersList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>Lecturer data will appear here</Text>
          </View>
        ) : (
          lecturersList.map((lecturer, index) => (
            <View key={index} style={styles.lecturerCard}>
              <View style={styles.lecturerLeft}>
                <View style={styles.lecturerAvatar}>
                  <Text style={styles.lecturerAvatarText}>
                    {lecturer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.lecturerInfo}>
                  <Text style={styles.lecturerName}>{lecturer.name}</Text>
                  <Text style={styles.lecturerSub}>
                    {lecturer.reviewedCount} reviewed · {lecturer.reportCount - lecturer.reviewedCount} pending
                  </Text>
                  {/* Progress Bar */}
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${lecturer.avgAttendance}%`,
                        backgroundColor: lecturer.avgAttendance >= 75 ? '#16a34a' : '#dc2626',
                      }
                    ]} />
                  </View>
                  <Text style={styles.attendanceText}>{lecturer.avgAttendance}% avg attendance</Text>
                </View>
              </View>
              <View style={styles.reportBadge}>
                <Text style={styles.reportBadgeNumber}>{lecturer.reportCount}</Text>
                <Text style={styles.reportBadgeLabel}>reports</Text>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
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
  ratingCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingInfo: { flex: 1 },
  ratingValue: { fontSize: 32, fontWeight: '900', color: '#f59e0b' },
  ratingLabel: { fontSize: 13, color: '#888', marginTop: 2 },
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
  lecturerCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lecturerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lecturerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6c3de0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lecturerAvatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  lecturerInfo: { flex: 1 },
  lecturerName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  lecturerSub: { fontSize: 11, color: '#888', marginTop: 2 },
  progressBar: {
    height: 4,
    backgroundColor: '#1a0533',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: { height: '100%', borderRadius: 2 },
  attendanceText: { fontSize: 10, color: '#888', marginTop: 2 },
  reportBadge: {
    backgroundColor: '#6c3de033',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  reportBadgeNumber: { fontSize: 20, fontWeight: '800', color: '#a78bfa' },
  reportBadgeLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  bottomSpacing: { height: 30 },
});

export default PLMonitoringScreen;