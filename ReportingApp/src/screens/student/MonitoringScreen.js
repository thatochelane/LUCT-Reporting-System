import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyAttendance } from '../../api/index';

const MonitoringScreen = ({ user }) => {
  const [coursesEnrolled, setCoursesEnrolled] = useState(0);
  const [classesAttended, setClassesAttended] = useState(0);
  const [classesMissed, setClassesMissed] = useState(0);
  const [overallRate, setOverallRate] = useState(0);
  const [courseBreakdown, setCourseBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getMyAttendance();
      if (response.attendance) {
        const records = response.attendance;
        const uniqueCourses = [...new Set(records.map(r => r.courseCode))];
        setCoursesEnrolled(uniqueCourses.length);
        const attended = records.filter(r => r.status === 'present').length;
        const missed = records.filter(r => r.status === 'absent').length;
        setClassesAttended(attended);
        setClassesMissed(missed);
        const rate = records.length > 0
          ? Math.round((attended / records.length) * 100)
          : 0;
        setOverallRate(rate);

        // Course breakdown
        const coursesMap = {};
        records.forEach(r => {
          if (!coursesMap[r.courseCode]) {
            coursesMap[r.courseCode] = {
              courseCode: r.courseCode,
              courseName: r.courseName,
              present: 0,
              absent: 0,
              late: 0,
              total: 0,
            };
          }
          coursesMap[r.courseCode].total++;
          coursesMap[r.courseCode][r.status]++;
        });
        setCourseBreakdown(Object.values(coursesMap));
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Courses Enrolled', value: loading ? '...' : String(coursesEnrolled), icon: 'book-outline' },
    { label: 'Classes Attended', value: loading ? '...' : String(classesAttended), icon: 'checkmark-circle-outline' },
    { label: 'Classes Missed', value: loading ? '...' : String(classesMissed), icon: 'close-circle-outline' },
    { label: 'Overall Rate', value: loading ? '...' : `${overallRate}%`, icon: 'stats-chart-outline' },
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

        {/* Overall Progress */}
        <Text style={styles.sectionTitle}>Attendance Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Attendance</Text>
            <Text style={styles.progressPercent}>{overallRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              {
                width: `${overallRate}%`,
                backgroundColor: overallRate >= 75 ? '#16a34a' : '#dc2626',
              }
            ]} />
          </View>
          <Text style={styles.progressNote}>
            {overallRate >= 75 ? 'Good attendance' : 'Attendance below 75%'}
          </Text>
        </View>

        {/* Course Breakdown */}
        <Text style={styles.sectionTitle}>Course Breakdown</Text>
        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 20 }} />
        ) : courseBreakdown.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="stats-chart-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>Your monitoring data will appear here</Text>
          </View>
        ) : (
          courseBreakdown.map((course, index) => {
            const rate = course.total > 0
              ? Math.round((course.present / course.total) * 100)
              : 0;
            return (
              <View key={index} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                    <Text style={styles.courseCode}>{course.courseCode}</Text>
                  </View>
                  <View style={[
                    styles.rateBadge,
                    { backgroundColor: rate >= 75 ? '#16a34a22' : '#dc262622' }
                  ]}>
                    <Text style={[
                      styles.rateText,
                      { color: rate >= 75 ? '#16a34a' : '#dc2626' }
                    ]}>
                      {rate}%
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${rate}%`,
                      backgroundColor: rate >= 75 ? '#16a34a' : '#dc2626',
                    }
                  ]} />
                </View>
                <View style={styles.courseStats}>
                  <Text style={[styles.courseStat, { color: '#16a34a' }]}>
                    ✓ {course.present} present
                  </Text>
                  <Text style={[styles.courseStat, { color: '#dc2626' }]}>
                    ✗ {course.absent} absent
                  </Text>
                  <Text style={[styles.courseStat, { color: '#d97706' }]}>
                    ⏱ {course.late} late
                  </Text>
                </View>
              </View>
            );
          })
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
  progressCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 24,
    gap: 8,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 14, color: '#ccc' },
  progressPercent: { fontSize: 14, fontWeight: '700', color: '#a78bfa' },
  progressBar: {
    height: 8,
    backgroundColor: '#1a0533',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressNote: { fontSize: 12, color: '#888', marginTop: 4 },
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
  rateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rateText: { fontSize: 13, fontWeight: '700' },
  courseStats: { flexDirection: 'row', justifyContent: 'space-between' },
  courseStat: { fontSize: 12 },
  bottomSpacing: { height: 30 },
});

export default MonitoringScreen;