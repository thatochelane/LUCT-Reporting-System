import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports } from '../../api/index';

const PRLCoursesScreen = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllReports();
      if (response.reports) {
        // Build unique courses from reports
        const coursesMap = {};
        response.reports.forEach(r => {
          if (!coursesMap[r.courseCode]) {
            coursesMap[r.courseCode] = {
              courseCode: r.courseCode,
              courseName: r.courseName,
              facultyName: r.facultyName,
              lecturerName: r.lecturerName,
              reportCount: 0,
            };
          }
          coursesMap[r.courseCode].reportCount++;
        });
        const list = Object.values(coursesMap);
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
        c.lecturerName.toLowerCase().includes(searchLower)
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
            <View key={index} style={styles.courseCard}>
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
              <Text style={styles.courseLecturer}>
                <Ionicons name="person-outline" size={12} color="#888" /> {course.lecturerName}
              </Text>
              <Text style={styles.courseFaculty}>
                <Ionicons name="business-outline" size={12} color="#888" /> {course.facultyName}
              </Text>
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
  courseLecturer: { fontSize: 12, color: '#888' },
  courseFaculty: { fontSize: 12, color: '#888' },
  reportBadge: {
    backgroundColor: '#6c3de033',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    minWidth: 55,
  },
  reportBadgeNumber: { fontSize: 18, fontWeight: '800', color: '#a78bfa' },
  reportBadgeLabel: { fontSize: 10, color: '#888', marginTop: 1 },
  bottomSpacing: { height: 30 },
});

export default PRLCoursesScreen;