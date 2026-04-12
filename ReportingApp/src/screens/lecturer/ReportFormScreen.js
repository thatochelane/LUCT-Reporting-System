import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createReport } from '../../api/index';


const InputField = ({ label, value, onChangeText, placeholder, multiline, keyboardType, editable }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.multilineInput,
        editable === false && styles.disabledInput,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#555"
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      keyboardType={keyboardType || 'default'}
      editable={editable !== false}
    />
  </View>
);

const ReportFormScreen = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [facultyName, setFacultyName] = useState(user?.facultyName || '');
  const [className, setClassName] = useState('');
  const [weekOfReporting, setWeekOfReporting] = useState('');
  const [dateOfLecture, setDateOfLecture] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [lecturerName, setLecturerName] = useState(user?.name || '');
  const [actualStudentsPresent, setActualStudentsPresent] = useState('');
  const [totalRegisteredStudents, setTotalRegisteredStudents] = useState('');
  const [venue, setVenue] = useState('');
  const [scheduledLectureTime, setScheduledLectureTime] = useState('');
  const [topicTaught, setTopicTaught] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const handleSubmit = async () => {
    if (
      !facultyName || !className || !weekOfReporting || !dateOfLecture ||
      !courseName || !courseCode || !lecturerName || !actualStudentsPresent ||
      !totalRegisteredStudents || !venue || !scheduledLectureTime ||
      !topicTaught || !learningOutcomes || !recommendations
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await createReport({
        facultyName,
        className,
        weekOfReporting,
        dateOfLecture,
        courseName,
        courseCode,
        lecturerName,
        actualStudentsPresent,
        totalRegisteredStudents,
        venue,
        scheduledLectureTime,
        topicTaught,
        learningOutcomes,
        recommendations,
      });

      if (response.reportId) {
        Alert.alert('Success', 'Report submitted successfully!');
        setClassName('');
        setWeekOfReporting('');
        setDateOfLecture('');
        setCourseName('');
        setCourseCode('');
        setActualStudentsPresent('');
        setTotalRegisteredStudents('');
        setVenue('');
        setScheduledLectureTime('');
        setTopicTaught('');
        setLearningOutcomes('');
        setRecommendations('');
      } else {
        Alert.alert('Error', response.message || 'Failed to submit report');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Lecture Report</Text>
        </View>

        <Text style={styles.subtitle}>Fill in all fields to submit your lecture report</Text>

        {/* Form Card */}
        <View style={styles.card}>

          <Text style={styles.sectionTitle}>General Information</Text>

          <InputField
            label="Faculty Name"
            value={facultyName}
            onChangeText={setFacultyName}
            placeholder="e.g. Faculty of ICT"
          />
          <InputField
            label="Class Name"
            value={className}
            onChangeText={setClassName}
            placeholder="e.g. BSCSM Year 3 Sem 2"
          />
          <InputField
            label="Week of Reporting"
            value={weekOfReporting}
            onChangeText={setWeekOfReporting}
            placeholder="e.g. Week 5"
          />
          <InputField
            label="Date of Lecture"
            value={dateOfLecture}
            onChangeText={setDateOfLecture}
            placeholder="e.g. 2024-03-15"
          />
          <InputField
            label="Venue"
            value={venue}
            onChangeText={setVenue}
            placeholder="e.g. Room 301"
          />
          <InputField
            label="Scheduled Lecture Time"
            value={scheduledLectureTime}
            onChangeText={setScheduledLectureTime}
            placeholder="e.g. 08:00 - 10:00"
          />

          <Text style={styles.sectionTitle}>Course Information</Text>

          <InputField
            label="Course Name"
            value={courseName}
            onChangeText={setCourseName}
            placeholder="e.g. Mobile Device Programming"
          />
          <InputField
            label="Course Code"
            value={courseCode}
            onChangeText={setCourseCode}
            placeholder="e.g. CSC3214"
          />
          <InputField
            label="Lecturer's Name"
            value={lecturerName}
            onChangeText={setLecturerName}
            placeholder="Your full name"
            editable={false}
          />

          <Text style={styles.sectionTitle}>Attendance</Text>

          <InputField
            label="Actual Students Present"
            value={actualStudentsPresent}
            onChangeText={setActualStudentsPresent}
            placeholder="e.g. 25"
            keyboardType="numeric"
          />
          <InputField
            label="Total Registered Students"
            value={totalRegisteredStudents}
            onChangeText={setTotalRegisteredStudents}
            placeholder="e.g. 30"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Lecture Details</Text>

          <InputField
            label="Topic Taught"
            value={topicTaught}
            onChangeText={setTopicTaught}
            placeholder="e.g. React Native Navigation"
            multiline
          />
          <InputField
            label="Learning Outcomes"
            value={learningOutcomes}
            onChangeText={setLearningOutcomes}
            placeholder="What students should be able to do after this lecture..."
            multiline
          />
          <InputField
            label="Lecturer's Recommendations"
            value={recommendations}
            onChangeText={setRecommendations}
            placeholder="Any recommendations or notes..."
            multiline
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitBtnInner}>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </View>
            )}
          </TouchableOpacity>
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
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    marginBottom: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#6c3de033',
    paddingBottom: 6,
  },
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
  multilineInput: { height: 90, textAlignVertical: 'top' },
  disabledInput: { opacity: 0.6 },
  submitBtn: {
    backgroundColor: '#6c3de0',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
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

export default ReportFormScreen;