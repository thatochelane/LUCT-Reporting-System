import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { markAttendance } from '../../api/index';

const StudentAttendanceScreen = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [className, setClassName] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('present');

  const statuses = ['present', 'absent', 'late'];

  const handleMark = async () => {
    if (!studentId || !studentName || !courseCode || !courseName || !className || !date) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await markAttendance({
        studentId,
        studentName,
        courseCode,
        courseName,
        className,
        date,
        status,
      });

      if (response.attendanceId) {
        Alert.alert('Success', 'Attendance marked successfully!');
        setStudentId('');
        setStudentName('');
        setCourseCode('');
        setCourseName('');
        setClassName('');
        setDate('');
        setStatus('present');
      } else {
        Alert.alert('Error', response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 8 }}
        >

        <View style={styles.header}>
          <Ionicons name="people-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Student Attendance</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attendance records..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Mark Attendance Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mark Attendance</Text>

          {[
            { label: 'Student ID', value: studentId, setter: setStudentId, placeholder: 'e.g. STU001' },
            { label: 'Student Name', value: studentName, setter: setStudentName, placeholder: 'Full name' },
            { label: 'Course Code', value: courseCode, setter: setCourseCode, placeholder: 'e.g. CSC3214' },
            { label: 'Course Name', value: courseName, setter: setCourseName, placeholder: 'e.g. Mobile Programming' },
            { label: 'Class Name', value: className, setter: setClassName, placeholder: 'e.g. BSCSM Y3S2' },
            { label: 'Date', value: date, setter: setDate, placeholder: 'e.g. 2024-03-15' },
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

          {/* Status Selector */}
          <Text style={styles.inputLabel}>Attendance Status</Text>
          <View style={styles.statusRow}>
            {statuses.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  status === s && styles.statusBtnActive,
                  s === 'present' && status === s && { backgroundColor: '#16a34a' },
                  s === 'absent' && status === s && { backgroundColor: '#dc2626' },
                  s === 'late' && status === s && { backgroundColor: '#d97706' },
                ]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.statusBtnText, status === s && { color: '#fff' }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleMark} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitBtnInner}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Mark Attendance</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
     </KeyboardAvoidingView>
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
  card: {
    backgroundColor: '#12022e',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6c3de0',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16 },
  inputWrapper: { marginBottom: 14 },
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
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 6 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6c3de0',
    alignItems: 'center',
  },
  statusBtnActive: { borderWidth: 0 },
  statusBtnText: { fontSize: 13, fontWeight: '600', color: '#a78bfa' },
  submitBtn: {
    backgroundColor: '#6c3de0',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomSpacing: { height: 30 },
});

export default StudentAttendanceScreen;