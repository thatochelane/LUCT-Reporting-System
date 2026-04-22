import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports, getAllRatings, getAllCourses } from '../../api/index';

const { width } = Dimensions.get('window');

const PLDashboard = ({ user, onLogout, navigation }) => {
  const [totalReports, setTotalReports] = useState(0);
  const [totalLecturers, setTotalLecturers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [avgRating, setAvgRating] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Try new courses collection first
      const coursesRes = await getAllCourses();
      if (coursesRes.courses) {
        setTotalCourses(coursesRes.courses.length);
      }

      const reportsRes = await getAllReports();
      if (reportsRes.reports) {
        const reports = reportsRes.reports;
        setTotalReports(reports.length);
        const uniqueLecturers = [...new Set(reports.map(r => r.lecturerUid))];
        setTotalLecturers(uniqueLecturers.length);
        setRecentReports(reports.slice(0, 3));

        // If no courses in collection use reports
        if (!coursesRes.courses || coursesRes.courses.length === 0) {
          const uniqueCourses = [...new Set(reports.map(r => r.courseCode))];
          setTotalCourses(uniqueCourses.length);
        }
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

  const cards = [
    { title: 'Courses', icon: 'library-outline', subtitle: 'Add & assign courses', color: '#12022e', tab: 'Courses' },
    { title: 'Reports', icon: 'document-text-outline', subtitle: 'View PRL reports', color: '#12022e', tab: 'Reports' },
    { title: 'Monitoring', icon: 'stats-chart-outline', subtitle: 'View all stats', color: '#12022e', tab: 'Monitoring' },
    { title: 'Classes', icon: 'book-outline', subtitle: 'View all classes', color: '#12022e', tab: 'Classes' },
    { title: 'Lecturers', icon: 'people-outline', subtitle: 'View all lecturers', color: '#12022e', tab: 'Lectures' },
    { title: 'Ratings', icon: 'star-outline', subtitle: 'View all ratings', color: '#12022e', tab: 'Rating' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>{user?.name || 'Program Leader'}</Text>
            <Text style={styles.userRole}>Program Leader · {user?.facultyName || 'LUCT'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerDiagonal} />
          <Ionicons name="briefcase-outline" size={32} color="#a78bfa" style={{ marginBottom: 8 }} />
          <Text style={styles.bannerTitle}>PL Portal</Text>
          <Text style={styles.bannerSubtitle}>LUCT Reporting System</Text>
          <Text style={styles.bannerDesc}>Faculty of Information{'\n'}Communication Technology</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(totalLecturers)}</Text>
            <Text style={styles.statLabel}>Lecturers</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(totalReports)}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="library-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(totalCourses)}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.cardsGrid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: card.color }]}
              onPress={() => {
                if (card.tab && navigation) {
                  navigation.jumpTo(card.tab);
                }
              }}
            >
              <Ionicons name={card.icon} size={28} color="#a78bfa" style={{ marginBottom: 10 }} />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Reports */}
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        {loading ? (
          <View style={styles.activityCard}>
            <Text style={styles.activityEmpty}>Loading...</Text>
          </View>
        ) : recentReports.length === 0 ? (
          <View style={styles.activityCard}>
            <Ionicons name="document-outline" size={32} color="#444" />
            <Text style={styles.activityEmpty}>No reports yet</Text>
          </View>
        ) : (
          recentReports.map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportLeft}>
                <Ionicons name="document-text-outline" size={24} color="#a78bfa" />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportCourse}>{report.courseName}</Text>
                <Text style={styles.reportCode}>{report.courseCode} · {report.className}</Text>
                <Text style={styles.reportDate}>{report.dateOfLecture}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: report.status === 'reviewed' ? '#16a34a22' : '#d9780622' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: report.status === 'reviewed' ? '#16a34a' : '#d97806' }
                ]}>
                  {report.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                </Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#a78bfa' },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 2 },
  userRole: { fontSize: 12, color: '#888', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c3de0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  banner: {
    backgroundColor: '#12022e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6c3de0',
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  bannerDiagonal: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    backgroundColor: '#6c3de0',
    opacity: 0.15,
    transform: [{ rotate: '45deg' }, { translateX: 60 }, { translateY: -60 }],
  },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  bannerSubtitle: { fontSize: 16, fontWeight: '700', color: '#a78bfa', marginTop: 2 },
  bannerDesc: { fontSize: 12, color: '#888', marginTop: 8, lineHeight: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 6 },
  statCard: {
    flex: 1,
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#a78bfa', marginTop: 4 },
  statLabel: { fontSize: 10, color: '#888', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 14 },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#6c3de0',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cardSubtitle: { fontSize: 11, color: '#a78bfa', lineHeight: 16 },
  activityCard: {
    backgroundColor: '#12022e',
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: '#6c3de0',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  activityEmpty: { color: '#666', fontSize: 14 },
  reportCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportLeft: { width: 36, alignItems: 'center' },
  reportInfo: { flex: 1 },
  reportCourse: { fontSize: 14, fontWeight: '700', color: '#fff' },
  reportCode: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  reportDate: { fontSize: 11, color: '#555', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bottomSpacing: { height: 20 },
});

export default PLDashboard;