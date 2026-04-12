import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports } from '../../api/index';

const { width } = Dimensions.get('window');

const PRLDashboard = ({ user, onLogout, navigation }) => {
  const [totalReports, setTotalReports] = useState(0);
  const [reviewedReports, setReviewedReports] = useState(0);
  const [totalLecturers, setTotalLecturers] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const reportsRes = await getAllReports();
      if (reportsRes.reports) {
        setTotalReports(reportsRes.reports.length);
        setPendingReports(reportsRes.reports.filter(r => r.status === 'pending').length);
        setReviewedReports(reportsRes.reports.filter(r => r.status === 'reviewed').length);
        const uniqueLecturers = [...new Set(reportsRes.reports.map(r => r.lecturerUid))];
        setTotalLecturers(uniqueLecturers.length);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Courses', icon: 'library-outline', subtitle: 'View all courses', color: '#12022e', tab: 'Courses' },
    { title: 'Reports', icon: 'document-text-outline', subtitle: 'View & add feedback', color: '#12022e', tab: 'Reports' },
    { title: 'Monitoring', icon: 'stats-chart-outline', subtitle: 'Monitor lectures', color: '#12022e', tab: 'Monitoring' },
    { title: 'Classes', icon: 'book-outline', subtitle: 'View all classes', color: '#12022e', tab: 'Classes' },
    { title: 'Ratings', icon: 'star-outline', subtitle: 'View all ratings', color: '#12022e', tab: 'Rating' },
    { title: 'Notifications', icon: 'notifications-outline', subtitle: 'Send announcements', color: '#12022e', tab: null },
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
            <Text style={styles.bannerSubtitle}>{user?.name || 'Principal Lecturer'}</Text>
            <Text style={styles.userRole}>Principal Lecturer · {user?.facultyName || 'LUCT'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerDiagonal} />
          <Ionicons name="shield-checkmark-outline" size={32} color="#a78bfa" style={{ marginBottom: 8 }} />
          <Text style={styles.bannerTitle}>PRL Portal</Text>
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
            <Ionicons name="checkmark-done-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(reviewedReports)}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
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

        {/* Pending Reports */}
        <Text style={styles.sectionTitle}>Pending Reports</Text>
        <View style={styles.activityCard}>
          {loading ? (
            <Text style={styles.activityEmpty}>Loading...</Text>
          ) : pendingReports === 0 ? (
            <>
              <Ionicons name="hourglass-outline" size={32} color="#444" />
              <Text style={styles.activityEmpty}>No pending reports</Text>
            </>
          ) : (
            <>
              <Ionicons name="hourglass-outline" size={32} color="#d97806" />
              <Text style={styles.pendingCount}>{pendingReports}</Text>
              <Text style={styles.pendingLabel}>Reports awaiting review</Text>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation && navigation.jumpTo('Reports')}
              >
                <Text style={styles.viewBtnText}>View Reports</Text>
                <Ionicons name="arrow-forward-outline" size={14} color="#a78bfa" />
              </TouchableOpacity>
            </>
          )}
        </View>

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
  bottomSpacing: { height: 20 },
  pendingCount: {
  fontSize: 40,
  fontWeight: '900',
  color: '#d97806',
},
pendingLabel: {
  fontSize: 13,
  color: '#ccc',
},
viewBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginTop: 4,
  backgroundColor: '#1a0533',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#6c3de0',
},
viewBtnText: {
  color: '#a78bfa',
  fontSize: 13,
  fontWeight: '600',
},
});

export default PRLDashboard;