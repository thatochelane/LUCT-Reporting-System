import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyReports } from '../../api/index';

const ClassesScreen = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await getMyReports();
      if (response.reports) {
        // Build unique classes from my reports
        const classesMap = {};
        response.reports.forEach(r => {
          if (!classesMap[r.className]) {
            classesMap[r.className] = {
              className: r.className,
              facultyName: r.facultyName,
              courses: new Set(),
              reportCount: 0,
              totalStudents: 0,
              totalPresent: 0,
              latestDate: r.dateOfLecture,
            };
          }
          classesMap[r.className].courses.add(r.courseCode);
          classesMap[r.className].reportCount++;
          classesMap[r.className].totalStudents += Number(r.totalRegisteredStudents || 0);
          classesMap[r.className].totalPresent += Number(r.actualStudentsPresent || 0);
          if (r.dateOfLecture > classesMap[r.className].latestDate) {
            classesMap[r.className].latestDate = r.dateOfLecture;
          }
        });

        const list = Object.values(classesMap).map(c => ({
          ...c,
          courses: c.courses.size,
          avgAttendance: c.totalStudents > 0
            ? Math.round((c.totalPresent / c.totalStudents) * 100)
            : 0,
        }));

        setClasses(list);
        setFiltered(list);
      }
    } catch (error) {
      console.log('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const searchLower = text.toLowerCase();
    setFiltered(
      classes.filter(c =>
        c.className.toLowerCase().includes(searchLower) ||
        c.facultyName.toLowerCase().includes(searchLower)
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="book-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>My Classes</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="book-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Classes Found</Text>
            <Text style={styles.emptySubtitle}>Your classes will appear once you submit reports</Text>
          </View>
        ) : (
          filtered.map((cls, index) => (
            <View key={index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{cls.className}</Text>
                <View style={[
                  styles.attendanceBadge,
                  { backgroundColor: cls.avgAttendance >= 75 ? '#16a34a22' : '#dc262622' }
                ]}>
                  <Text style={[
                    styles.attendanceText,
                    { color: cls.avgAttendance >= 75 ? '#16a34a' : '#dc2626' }
                  ]}>
                    {cls.avgAttendance}% avg
                  </Text>
                </View>
              </View>
              <Text style={styles.classFaculty}>
                <Ionicons name="business-outline" size={12} color="#888" /> {cls.facultyName}
              </Text>
              <Text style={styles.classDate}>
                <Ionicons name="calendar-outline" size={12} color="#888" /> Last: {cls.latestDate}
              </Text>
              <View style={styles.classStats}>
                <View style={styles.classStat}>
                  <Text style={styles.classStatValue}>{cls.courses}</Text>
                  <Text style={styles.classStatLabel}>Courses</Text>
                </View>
                <View style={styles.classStat}>
                  <Text style={styles.classStatValue}>{cls.reportCount}</Text>
                  <Text style={styles.classStatLabel}>Reports</Text>
                </View>
                <View style={styles.classStat}>
                  <Text style={styles.classStatValue}>{cls.totalStudents}</Text>
                  <Text style={styles.classStatLabel}>Students</Text>
                </View>
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
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  className: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  attendanceText: { fontSize: 11, fontWeight: '700' },
  classFaculty: { fontSize: 12, color: '#888' },
  classDate: { fontSize: 12, color: '#888' },
  classStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#6c3de033',
  },
  classStat: { alignItems: 'center' },
  classStatValue: { fontSize: 18, fontWeight: '800', color: '#a78bfa' },
  classStatLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  bottomSpacing: { height: 30 },
});

export default ClassesScreen;