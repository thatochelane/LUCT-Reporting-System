import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports, getAllRatings } from '../../api/index';

const PLLecturesScreen = ({ user }) => {
  const [lecturers, setLecturers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const reportsRes = await getAllReports();
      const ratingsRes = await getAllRatings();

      if (reportsRes.reports) {
        const lecturersMap = {};

        reportsRes.reports.forEach(r => {
          if (!lecturersMap[r.lecturerUid]) {
            lecturersMap[r.lecturerUid] = {
              uid: r.lecturerUid,
              name: r.lecturerName,
              facultyName: r.facultyName,
              reportCount: 0,
              reviewedCount: 0,
              pendingCount: 0,
              courses: new Set(),
              classes: new Set(),
              totalPresent: 0,
              totalRegistered: 0,
              ratings: [],
            };
          }
          lecturersMap[r.lecturerUid].reportCount++;
          if (r.status === 'reviewed') {
            lecturersMap[r.lecturerUid].reviewedCount++;
          } else {
            lecturersMap[r.lecturerUid].pendingCount++;
          }
          lecturersMap[r.lecturerUid].courses.add(r.courseCode);
          lecturersMap[r.lecturerUid].classes.add(r.className);
          lecturersMap[r.lecturerUid].totalPresent += Number(r.actualStudentsPresent || 0);
          lecturersMap[r.lecturerUid].totalRegistered += Number(r.totalRegisteredStudents || 0);
        });

        // Add ratings
        if (ratingsRes.ratings) {
          ratingsRes.ratings.forEach(r => {
            if (lecturersMap[r.lecturerUid]) {
              lecturersMap[r.lecturerUid].ratings.push(r.rating);
            }
          });
        }

        const list = Object.values(lecturersMap).map(l => ({
          ...l,
          courses: l.courses.size,
          classes: l.classes.size,
          avgAttendance: l.totalRegistered > 0
            ? Math.round((l.totalPresent / l.totalRegistered) * 100)
            : 0,
          avgRating: l.ratings.length > 0
            ? (l.ratings.reduce((sum, r) => sum + r, 0) / l.ratings.length).toFixed(1)
            : '0.0',
          totalRatings: l.ratings.length,
        }));

        setLecturers(list);
        setFiltered(list);
      }
    } catch (error) {
      console.log('Error fetching lecturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const searchLower = text.toLowerCase();
    setFiltered(
      lecturers.filter(l =>
        l.name.toLowerCase().includes(searchLower) ||
        l.facultyName.toLowerCase().includes(searchLower)
      )
    );
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < Math.round(rating) ? 'star' : 'star-outline'}
        size={12}
        color="#f59e0b"
      />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="people-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Lecturers</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(lecturers.length)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String(lecturers.reduce((sum, l) => sum + l.reportCount, 0))}
            </Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : (
                lecturers.length > 0
                  ? (lecturers.reduce((sum, l) => sum + Number(l.avgRating), 0) / lecturers.length).toFixed(1)
                  : '0.0'
              )}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lecturers..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Lecturers Found</Text>
            <Text style={styles.emptySubtitle}>Lecturers will appear once they submit reports</Text>
          </View>
        ) : (
          filtered.map((lecturer, index) => (
            <TouchableOpacity
              key={index}
              style={styles.lecturerCard}
              onPress={() => { setSelectedLecturer(lecturer); setModalVisible(true); }}
            >
              <View style={styles.lecturerLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {lecturer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.lecturerInfo}>
                  <Text style={styles.lecturerName}>{lecturer.name}</Text>
                  <Text style={styles.lecturerFaculty}>{lecturer.facultyName}</Text>
                  <View style={styles.starsRow}>
                    {renderStars(lecturer.avgRating)}
                    <Text style={styles.ratingText}>{lecturer.avgRating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.lecturerRight}>
                <Text style={styles.reportCount}>{lecturer.reportCount}</Text>
                <Text style={styles.reportLabel}>reports</Text>
                <View style={[
                  styles.attendanceBadge,
                  { backgroundColor: lecturer.avgAttendance >= 75 ? '#16a34a22' : '#dc262622' }
                ]}>
                  <Text style={[
                    styles.attendanceText,
                    { color: lecturer.avgAttendance >= 75 ? '#16a34a' : '#dc2626' }
                  ]}>
                    {lecturer.avgAttendance}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Lecturer Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {selectedLecturer?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.modalName}>{selectedLecturer?.name}</Text>
                <Text style={styles.modalFaculty}>{selectedLecturer?.facultyName}</Text>
              </View>
            </View>

            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{selectedLecturer?.reportCount}</Text>
                <Text style={styles.modalStatLabel}>Reports</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{selectedLecturer?.courses}</Text>
                <Text style={styles.modalStatLabel}>Courses</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{selectedLecturer?.classes}</Text>
                <Text style={styles.modalStatLabel}>Classes</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{selectedLecturer?.avgRating}</Text>
                <Text style={styles.modalStatLabel}>Rating</Text>
              </View>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetail}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#16a34a" />
                <Text style={styles.modalDetailText}>{selectedLecturer?.reviewedCount} reports reviewed</Text>
              </View>
              <View style={styles.modalDetail}>
                <Ionicons name="hourglass-outline" size={16} color="#d97806" />
                <Text style={styles.modalDetailText}>{selectedLecturer?.pendingCount} reports pending</Text>
              </View>
              <View style={styles.modalDetail}>
                <Ionicons name="people-outline" size={16} color="#a78bfa" />
                <Text style={styles.modalDetailText}>{selectedLecturer?.avgAttendance}% average attendance</Text>
              </View>
              <View style={styles.modalDetail}>
                <Ionicons name="star-outline" size={16} color="#f59e0b" />
                <Text style={styles.modalDetailText}>{selectedLecturer?.totalRatings} student ratings</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    gap: 6,
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#a78bfa' },
  statLabel: { fontSize: 11, color: '#888' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12022e',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
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
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lecturerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#6c3de0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  lecturerInfo: { flex: 1 },
  lecturerName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  lecturerFaculty: { fontSize: 12, color: '#888', marginTop: 2 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: { fontSize: 11, color: '#f59e0b', marginLeft: 4 },
  lecturerRight: { alignItems: 'center', gap: 4 },
  reportCount: { fontSize: 20, fontWeight: '800', color: '#a78bfa' },
  reportLabel: { fontSize: 10, color: '#888' },
  attendanceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  attendanceText: { fontSize: 11, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#12022e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#6c3de0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6c3de0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  modalName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalFaculty: { fontSize: 13, color: '#888', marginTop: 2 },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a0533',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  modalStat: { alignItems: 'center' },
  modalStatValue: { fontSize: 22, fontWeight: '800', color: '#a78bfa' },
  modalStatLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  modalDetails: { gap: 12, marginBottom: 20 },
  modalDetail: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalDetailText: { fontSize: 14, color: '#ccc' },
  closeBtn: {
    backgroundColor: '#6c3de0',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bottomSpacing: { height: 30 },
});

export default PLLecturesScreen;