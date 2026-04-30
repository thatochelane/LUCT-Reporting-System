import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyCourses } from '../../api/index';

const ClassesScreen = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getMyCourses();
      console.log('Fetched courses:', response);
      
      if (response.courses) {
        // Group courses by class name if needed
        const coursesMap = {};
        response.courses.forEach(course => {
          // Use className or create a default
          const className = course.className || course.courseCode || 'Unassigned Class';
          
          if (!coursesMap[className]) {
            coursesMap[className] = {
              className: className,
              facultyName: course.facultyName || 'N/A',
              courses: [],
              courseCodes: new Set(),
            };
          }
          coursesMap[className].courses.push(course);
          coursesMap[className].courseCodes.add(course.courseCode);
        });

        const list = Object.values(coursesMap).map(item => ({
          className: item.className,
          facultyName: item.facultyName,
          courseCount: item.courses.length,
          courseCodes: Array.from(item.courseCodes).join(', '),
          courses: item.courses,
        }));

        setCourses(list);
        setFiltered(list);
      } else {
        setCourses([]);
        setFiltered([]);
      }
    } catch (error) {
      console.log('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleSearch = (text) => {
    setSearch(text);
    const searchLower = text.toLowerCase();
    setFiltered(
      courses.filter(course =>
        course.className.toLowerCase().includes(searchLower) ||
        course.facultyName.toLowerCase().includes(searchLower) ||
        course.courseCodes.toLowerCase().includes(searchLower)
      )
    );
  };

  // Check if user is logged in as lecturer
  if (!user || user.role !== 'lecturer') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>Access Denied</Text>
            <Text style={styles.emptySubtitle}>Only lecturers can view assigned classes</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />
        }
      >

        <View style={styles.header}>
          <Ionicons name="book-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>My Assigned Classes</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by class, faculty or course..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Classes Assigned</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'No matching classes found' : 'You haven\'t been assigned to any classes yet'}
            </Text>
            <Text style={styles.emptyHint}>Contact your PL to get course assignments</Text>
          </View>
        ) : (
          filtered.map((classItem, index) => (
            <View key={index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classItem.className}</Text>
                <View style={styles.courseCountBadge}>
                  <Text style={styles.courseCountText}>{classItem.courseCount} courses</Text>
                </View>
              </View>
              
              <Text style={styles.classFaculty}>
                <Ionicons name="business-outline" size={12} color="#888" /> {classItem.facultyName}
              </Text>
              
              <View style={styles.courseCodesContainer}>
                <Text style={styles.courseCodesLabel}>Course Codes:</Text>
                <Text style={styles.courseCodes}>{classItem.courseCodes}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.coursesList}>
                <Text style={styles.coursesTitle}>Assigned Courses:</Text>
                {classItem.courses.map((course, idx) => (
                  <View key={idx} style={styles.courseItem}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#a78bfa" />
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseCode}>{course.courseCode}</Text>
                      <Text style={styles.courseName}>{course.courseName || 'No course name'}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {classItem.courses.some(c => c.assignedAt) && (
                <Text style={styles.assignedDate}>
                  <Ionicons name="time-outline" size={10} color="#666" /> 
                  Assigned: {new Date(classItem.courses[0].assignedAt?.toDate?.() || classItem.courses[0].assignedAt).toLocaleDateString()}
                </Text>
              )}
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
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
  emptyHint: { fontSize: 12, color: '#a78bfa', marginTop: 8 },
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  className: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  courseCountBadge: {
    backgroundColor: '#6c3de033',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  courseCountText: { fontSize: 11, color: '#a78bfa', fontWeight: '600' },
  classFaculty: { fontSize: 13, color: '#aaa', marginBottom: 4 },
  courseCodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  courseCodesLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
  courseCodes: { fontSize: 12, color: '#a78bfa', flex: 1 },
  divider: {
    height: 1,
    backgroundColor: '#6c3de033',
    marginVertical: 8,
  },
  coursesList: {
    gap: 8,
  },
  coursesTitle: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 4 },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#1a0533',
    borderRadius: 8,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: { fontSize: 13, fontWeight: '600', color: '#a78bfa' },
  courseName: { fontSize: 11, color: '#aaa' },
  assignedDate: { fontSize: 10, color: '#666', marginTop: 8, textAlign: 'right' },
  bottomSpacing: { height: 30 },
});

export default ClassesScreen;