import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports } from '../../api/index';

const PLCoursesScreen = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllReports();
      if (response.reports) {
        const coursesMap = {};
        response.reports.forEach(r => {
          if (!coursesMap[r.courseCode]) {
            coursesMap[r.courseCode] = {
              courseCode: r.courseCode,
              courseName: r.courseName,
              facultyName: r.facultyName,
              lecturerName: r.lecturerName,
              lecturerUid: r.lecturerUid,
              reportCount: 0,
              classes: new Set(),
            };
          }
          coursesMap[r.courseCode].reportCount++;
          coursesMap[r.courseCode].classes.add(r.className);
        });
        const list = Object.values(coursesMap).map(c => ({
          ...c,
          classes: c.classes.size,
        }));
        setCourses(list);
        setFiltered(list);
      }
    } catch (error) {
      console.log('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const searchLower = text.toLowerCase();
    setFiltered(
      courses.filter(c =>
        c.courseName.toLowerCase().includes(searchLower) ||
        c.courseCode.toLowerCase().includes(searchLower) ||
        c.lecturerName.toLowerCase().includes(searchLower) ||
        c.facultyName.toLowerCase().includes(searchLower)
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="library-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Courses</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="library-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(courses.length)}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String([...new Set(courses.map(c => c.lecturerUid))].length)}
            </Text>
            <Text style={styles.statLabel}>Lecturers</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="library-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptySubtitle}>Courses will appear once lecturers submit reports</Text>
          </View>
        ) : (
          filtered.map((course, index) => (
            <TouchableOpacity
              key={index}
              style={styles.courseCard}
              onPress={() => { setSelectedCourse(course); setModalVisible(true); }}
            >
              <View style={styles.courseHeader}>
                <View style={styles.courseCodeBadge}>
                  <Text style={styles.courseCodeText}>{course.courseCode}</Text>
                </View>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeNumber}>{course.reportCount}</Text>
                  <Text style={styles.reportBadgeLabel}>reports</Text>
                </View>
              </View>
              <Text style={styles.courseName}>{course.courseName}</Text>
              <Text style={styles.courseDetail}>
                <Ionicons name="person-outline" size={12} color="#888" /> {course.lecturerName}
              </Text>
              <Text style={styles.courseDetail}>
                <Ionicons name="business-outline" size={12} color="#888" /> {course.facultyName}
              </Text>
              <Text style={styles.courseDetail}>
                <Ionicons name="book-outline" size={12} color="#888" /> {course.classes} classes
              </Text>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Course Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedCourse?.courseName}</Text>
            <Text style={styles.modalCode}>{selectedCourse?.courseCode}</Text>
            <View style={styles.modalDetails}>
              <View style={styles.modalDetail}>
                <Ionicons name="person-outline" size={16} color="#a78bfa" />
                <Text style={styles.modalDetailText}>{selectedCourse?.lecturerName}</Text>
              </View>
              <View style={styles.modalDetail}>
                <Ionicons name="business-outline" size={16} color="#a78bfa" />
                <Text style={styles.modalDetailText}>{selectedCourse?.facultyName}</Text>
              </View>
              <View style={styles.modalDetail}>
                <Ionicons name="document-text-outline" size={16} color="#a78bfa" />
                <Text style={styles.modalDetailText}>{selectedCourse?.reportCount} reports submitted</Text>
              </View>
              <View style={styles.modalDetail}>
                <Ionicons name="book-outline" size={16} color="#a78bfa" />
                <Text style={styles.modalDetailText}>{selectedCourse?.classes} classes</Text>
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
  courseCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 12,
    gap: 6,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseCodeBadge: {
    backgroundColor: '#6c3de0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  courseCodeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  courseName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  courseDetail: { fontSize: 12, color: '#888' },
  reportBadge: {
    backgroundColor: '#6c3de033',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    minWidth: 55,
  },
  reportBadgeNumber: { fontSize: 18, fontWeight: '800', color: '#a78bfa' },
  reportBadgeLabel: { fontSize: 10, color: '#888', marginTop: 1 },
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  modalCode: { fontSize: 13, color: '#a78bfa', marginBottom: 16 },
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

export default PLCoursesScreen;