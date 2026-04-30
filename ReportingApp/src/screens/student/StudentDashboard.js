import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyAttendance, getMySubmittedRatings } from '../../api/index';

const { width } = Dimensions.get('window');

const StudentDashboard = ({ user, onLogout, navigation }) => {
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
  try {
    // Attendance
    const attendanceRes = await getMyAttendance();
    if (attendanceRes.attendance) {
      const records = attendanceRes.attendance;
      const uniqueClasses = [...new Set(records.map(r => r.className))];
      setTotalClasses(uniqueClasses.length);
      const present = records.filter(r => r.status === 'present').length;
      const rate = records.length > 0
        ? Math.round((present / records.length) * 100)
        : 0;
      setAttendanceRate(rate);
      setRecentAttendance(records.slice(0, 3));
    }

    // Ratings submitted by this student
    const ratingsRes = await getMySubmittedRatings();
    if (ratingsRes.ratings) {
      setTotalRatings(ratingsRes.ratings.length);
    }
  } catch (error) {
    console.log('Error fetching stats:', error);
  } finally {
    setLoading(false);
  }
};

  const cards = [
    { title: 'My Attendance', icon: 'calendar-outline', subtitle: 'View your attendance records', color: '#12022e', tab: 'Attendance' },
    { title: 'Monitoring', icon: 'stats-chart-outline', subtitle: 'Track your progress', color: '#12022e', tab: 'Monitoring' },
    { title: 'Rate Lecturer', icon: 'star-outline', subtitle: 'Give feedback on lectures', color: '#12022e', tab: 'Rating' },
    { title: 'Home', icon: 'home-outline', subtitle: 'Recents', color: '#12022e', tab: null },
  ];

  const getStatusColor = (status) => {
    if (status === 'present') return '#16a34a';
    if (status === 'absent') return '#dc2626';
    return '#d97706';
  };

  const getStatusIcon = (status) => {
    if (status === 'present') return 'checkmark-circle';
    if (status === 'absent') return 'close-circle';
    return 'time';
  };

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
            <Text style={styles.bannerSubtitle}>{user?.name || 'Student'}</Text>
            <Text style={styles.userRole}>Student · {user?.facultyName || 'LUCT'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerDiagonal} />
          <Ionicons name="school-outline" size={32} color="#a78bfa" style={{ marginBottom: 8 }} />
          <Text style={styles.bannerTitle}>LUCT Faculty</Text>
          <Text style={styles.bannerSubtitle}>Reporting System</Text>
          <Text style={styles.bannerDesc}>Faculty of Information{'\n'}Communication Technology</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(totalClasses)}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : `${attendanceRate}%`}</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(totalRatings)}</Text>
            <Text style={styles.statLabel}>Ratings</Text>
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

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {loading ? (
          <View style={styles.activityCard}>
            <Text style={styles.activityEmpty}>Loading...</Text>
          </View>
        ) : recentAttendance.length === 0 ? (
          <View style={styles.activityCard}>
            <Ionicons name="time-outline" size={32} color="#444" />
            <Text style={styles.activityEmpty}>No recent activity yet</Text>
          </View>
        ) : (
          recentAttendance.map((record, index) => (
            <View key={index} style={styles.recordCard}>
              <Ionicons
                name={getStatusIcon(record.status)}
                size={28}
                color={getStatusColor(record.status)}
              />
              <View style={styles.recordInfo}>
                <Text style={styles.recordCourse}>{record.courseName}</Text>
                <Text style={styles.recordCode}>{record.courseCode} · {record.className}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(record.status) + '22' }
              ]}>
                <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#a78bfa', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4 },
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
  recordCard: {
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
  recordInfo: { flex: 1 },
  recordCourse: { fontSize: 14, fontWeight: '700', color: '#fff' },
  recordCode: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  recordDate: { fontSize: 11, color: '#555', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bottomSpacing: { height: 20 },
});

export default StudentDashboard;