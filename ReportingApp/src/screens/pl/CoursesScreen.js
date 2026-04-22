import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllCourses, createCourse, assignLecturer, deleteCourse, getAllReports } from '../../api/index';

const PLCoursesScreen = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add course form
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [className, setClassName] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');

  // Assign lecturer form
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerUid, setLecturerUid] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const [coursesRes, reportsRes] = await Promise.all([
        getAllCourses(),
        getAllReports(),
      ]);

      const allCoursesMap = {};

      // Add courses from reports first
      if (reportsRes.reports) {
        reportsRes.reports.forEach(r => {
          if (!allCoursesMap[r.courseCode]) {
            allCoursesMap[r.courseCode] = {
              id: r.courseCode,
              courseCode: r.courseCode,
              courseName: r.courseName,
              facultyName: r.facultyName,
              lecturerName: r.lecturerName,
              lecturerUid: r.lecturerUid,
              className: r.className,
              semester: '',
              year: '',
              fromReports: true,
            };
          }
        });
      }

      // Add/override with courses from courses collection
      if (coursesRes.courses) {
        coursesRes.courses.forEach(c => {
          allCoursesMap[c.courseCode] = {
            ...c,
            fromReports: false,
          };
        });
      }

      const list = Object.values(allCoursesMap);
      setCourses(list);
      setFiltered(list);
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
        c.facultyName.toLowerCase().includes(searchLower) ||
        c.lecturerName.toLowerCase().includes(searchLower)
      )
    );
  };

  const handleAddCourse = async () => {
    if (!courseName || !courseCode || !facultyName) {
      Alert.alert('Error', 'Course name, code and faculty are required');
      return;
    }
    setSubmitting(true);
    try {
      const response = await createCourse({
        courseName,
        courseCode,
        facultyName,
        className,
        semester,
        year,
      });
      if (response.courseId) {
        Alert.alert('Success', 'Course added successfully!');
        setAddModalVisible(false);
        setCourseName('');
        setCourseCode('');
        setFacultyName('');
        setClassName('');
        setSemester('');
        setYear('');
        fetchCourses();
      } else {
        Alert.alert('Error', response.message || 'Failed to add course');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignLecturer = async () => {
    if (!lecturerName || !lecturerUid) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const response = await assignLecturer(selectedCourse.id, {
        lecturerName,
        lecturerUid,
      });
      if (response.message === 'Lecturer assigned successfully') {
        Alert.alert('Success', 'Lecturer assigned successfully!');
        setAssignModalVisible(false);
        setLecturerName('');
        setLecturerUid('');
        fetchCourses();
      } else {
        Alert.alert('Error', response.message || 'Failed to assign lecturer');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(id);
              fetchCourses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete course');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="library-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Courses</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add-outline" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Course</Text>
          </TouchableOpacity>
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
              {loading ? '...' : String(courses.filter(c => c.lecturerUid).length)}
            </Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String(courses.filter(c => !c.lecturerUid).length)}
            </Text>
            <Text style={styles.statLabel}>Unassigned</Text>
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
            <Text style={styles.emptySubtitle}>Tap "Add Course" to create one</Text>
          </View>
        ) : (
          filtered.map((course, index) => (
            <View key={index} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseCodeBadge}>
                  <Text style={styles.courseCodeText}>{course.courseCode}</Text>
                </View>
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.assignBtn}
                    onPress={() => {
                      setSelectedCourse(course);
                      setAssignModalVisible(true);
                    }}
                  >
                    <Ionicons name="person-add-outline" size={16} color="#a78bfa" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteCourse(course.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.courseName}>{course.courseName}</Text>
              <Text style={styles.courseDetail}>
                <Ionicons name="business-outline" size={12} color="#888" /> {course.facultyName}
              </Text>
              {course.className ? (
                <Text style={styles.courseDetail}>
                  <Ionicons name="book-outline" size={12} color="#888" /> {course.className}
                </Text>
              ) : null}
              {course.semester ? (
                <Text style={styles.courseDetail}>
                  <Ionicons name="calendar-outline" size={12} color="#888" /> Semester {course.semester} · {course.year}
                </Text>
              ) : null}

              {/* Lecturer Assignment Status */}
              <View style={styles.lecturerStatus}>
                {course.lecturerName ? (
                  <View style={styles.assignedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                    <Text style={styles.assignedText}>{course.lecturerName}</Text>
                  </View>
                ) : (
                  <View style={styles.unassignedBadge}>
                    <Ionicons name="alert-circle" size={14} color="#d97806" />
                    <Text style={styles.unassignedText}>No lecturer assigned</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Course</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#a78bfa" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                { label: 'Course Name *', value: courseName, setter: setCourseName, placeholder: 'e.g. Mobile Programming' },
                { label: 'Course Code *', value: courseCode, setter: setCourseCode, placeholder: 'e.g. CSC3214' },
                { label: 'Faculty Name *', value: facultyName, setter: setFacultyName, placeholder: 'e.g. Faculty of ICT' },
                { label: 'Class Name', value: className, setter: setClassName, placeholder: 'e.g. BSCSM Y3S2' },
                { label: 'Semester', value: semester, setter: setSemester, placeholder: 'e.g. 2' },
                { label: 'Year', value: year, setter: setYear, placeholder: 'e.g. 2024' },
              ].map((field, index) => (
                <View key={index} style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor="#555"
                  />
                </View>
              ))}

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleAddCourse}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Add Course</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Assign Lecturer Modal */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Assign Lecturer</Text>
            <Text style={styles.modalSubtitle}>{selectedCourse?.courseName}</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Lecturer Name</Text>
              <TextInput
                style={styles.input}
                value={lecturerName}
                onChangeText={setLecturerName}
                placeholder="Full name"
                placeholderTextColor="#555"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Lecturer UID</Text>
              <TextInput
                style={styles.input}
                value={lecturerUid}
                onChangeText={setLecturerUid}
                placeholder="Firebase UID of lecturer"
                placeholderTextColor="#555"
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setAssignModalVisible(false);
                  setLecturerName('');
                  setLecturerUid('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAssignLecturer}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Assign</Text>
                )}
              </TouchableOpacity>
            </View>
           </ScrollView>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', flex: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c3de0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    gap: 6,
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#a78bfa' },
  statLabel: { fontSize: 10, color: '#888', textAlign: 'center' },
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
  courseActions: { flexDirection: 'row', gap: 10 },
  assignBtn: {
    backgroundColor: '#6c3de022',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c3de0',
  },
  deleteBtn: {
    backgroundColor: '#dc262622',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  courseName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  courseDetail: { fontSize: 12, color: '#888' },
  lecturerStatus: { marginTop: 6 },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  assignedText: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  unassignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d9780622',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  unassignedText: { fontSize: 12, color: '#d97806', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCard: {
    backgroundColor: '#12022e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#6c3de0',
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#a78bfa', marginBottom: 16 },
  inputWrapper: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: '#ccc', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#1a0533',
    borderWidth: 1,
    borderColor: '#6c3de0',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6c3de0',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#a78bfa', fontWeight: '600' },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#6c3de0',
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  bottomSpacing: { height: 30 },
});

export default PLCoursesScreen;