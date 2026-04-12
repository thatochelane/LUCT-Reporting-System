import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyAttendance } from '../../api/index';

const AttendanceScreen = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await getMyAttendance(search);
      if (response.attendance) {
        setAttendance(response.attendance);
        setSummary(response.summary || []);
      }
    } catch (error) {
      console.log('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <Ionicons name="calendar-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>My Attendance</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by course..."
            placeholderTextColor="#555"
            value={search}
           onChangeText={(text) => {
              setSearch(text);
              if (text === '') fetchAttendance();
            }}
          />
            <TouchableOpacity onPress={() => fetchAttendance()}>
          <Ionicons name="arrow-forward-circle-outline" size={22} color="#a78bfa" />
        </TouchableOpacity>
      </View>

        {/* Summary Cards */}
        {summary.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Course Summary</Text>
            {summary.map((s, index) => (
              <View key={index} style={styles.summaryCard}>
                <Text style={styles.summaryCourseName}>{s.courseName}</Text>
                <Text style={styles.summaryCourseCode}>{s.courseCode}</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryStatValue, { color: '#16a34a' }]}>{s.present}</Text>
                    <Text style={styles.summaryStatLabel}>Present</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryStatValue, { color: '#dc2626' }]}>{s.absent}</Text>
                    <Text style={styles.summaryStatLabel}>Absent</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryStatValue, { color: '#d97706' }]}>{s.late}</Text>
                    <Text style={styles.summaryStatLabel}>Late</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatValue}>{s.total}</Text>
                    <Text style={styles.summaryStatLabel}>Total</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Attendance Records */}
        <Text style={styles.sectionTitle}>All Records</Text>
        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : attendance.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Attendance Records</Text>
            <Text style={styles.emptySubtitle}>Your attendance records will appear here</Text>
          </View>
        ) : (
          attendance.map((record, index) => (
            <View key={index} style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <Ionicons
                  name={getStatusIcon(record.status)}
                  size={28}
                  color={getStatusColor(record.status)}
                />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordCourse}>{record.courseName}</Text>
                <Text style={styles.recordCode}>{record.courseCode} · {record.className}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) + '22' }]}>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 14 },
  summaryCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 12,
  },
  summaryCourseName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  summaryCourseCode: { fontSize: 12, color: '#a78bfa', marginBottom: 12 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center' },
  summaryStatValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  summaryStatLabel: { fontSize: 11, color: '#888', marginTop: 2 },
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
  recordLeft: { width: 36, alignItems: 'center' },
  recordInfo: { flex: 1 },
  recordCourse: { fontSize: 14, fontWeight: '700', color: '#fff' },
  recordCode: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  recordDate: { fontSize: 11, color: '#555', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bottomSpacing: { height: 30 },
});

export default AttendanceScreen;