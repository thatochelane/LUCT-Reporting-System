import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports, addFeedback } from '../../api/index';
import { exportReportsToExcel } from '../../utils/excelExport';

const PRLReportsScreen = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getAllReports(search);
      if (response.reports) setReports(response.reports);
    } catch (error) {
      console.log('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedback) {
      Alert.alert('Error', 'Please enter feedback');
      return;
    }
    setSubmitting(true);
    try {
      const response = await addFeedback(selectedReport.id, feedback);
      if (response.message === 'Feedback added successfully') {
        Alert.alert('Success', 'Feedback submitted!');
        setModalVisible(false);
        setFeedback('');
        fetchReports();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Lecture Reports</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={(text) => { setSearch(text); fetchReports(); }}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : reports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>Lecturer reports will appear here</Text>
          </View>
        ) : (
          reports.map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <Text style={styles.reportCourse}>{report.courseName}</Text>
                  <Text style={styles.reportCode}>{report.courseCode}</Text>
                </View>

                <TouchableOpacity
                  onPress={async () => {
                    setExportingId(report.id);
                    const result = await exportReportsToExcel([report]);
                    setExportingId(null);
                    if (!result.success) {
                      Alert.alert('Error', 'Failed to export report');
                    }
                  }}
                  disabled={exportingId === report.id}
                  style={{ marginRight: 8 }}
                >
                  {exportingId === report.id ? (
                    <ActivityIndicator color="#16a34a" size="small" />
                  ) : (
                    <Ionicons name="download-outline" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>

                <View style={[
                  styles.statusBadge,
                  { backgroundColor: report.status === 'reviewed' ? '#16a34a22' : '#d9780622' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: report.status === 'reviewed' ? '#16a34a' : '#d97806' }
                  ]}>
                    {report.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportLecturer}>
                <Ionicons name="person-outline" size={12} color="#888" /> {report.lecturerName}
              </Text>
              <Text style={styles.reportDetail}>
                <Ionicons name="calendar-outline" size={12} color="#888" /> {report.dateOfLecture} · Week {report.weekOfReporting}
              </Text>
              <Text style={styles.reportDetail}>
                <Ionicons name="location-outline" size={12} color="#888" /> {report.venue} · {report.scheduledLectureTime}
              </Text>
              <Text style={styles.reportTopic} numberOfLines={2}>
                Topic: {report.topicTaught}
              </Text>
              {report.feedback ? (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackLabel}>Your Feedback:</Text>
                  <Text style={styles.feedbackText}>{report.feedback}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.feedbackBtn}
                onPress={() => { setSelectedReport(report); setModalVisible(true); }}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#a78bfa" />
                <Text style={styles.feedbackBtnText}>
                  {report.feedback ? 'Update Feedback' : 'Add Feedback'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Feedback Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Feedback</Text>
            <Text style={styles.modalSubtitle}>{selectedReport?.courseName}</Text>
            <TextInput
              style={styles.modalInput}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Write your feedback..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setFeedback(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleFeedback} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
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
  reportCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 14,
    gap: 6,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportHeaderLeft: { flex: 1 },
  reportCourse: { fontSize: 15, fontWeight: '700', color: '#fff' },
  reportCode: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  reportLecturer: { fontSize: 13, color: '#ccc' },
  reportDetail: { fontSize: 12, color: '#888' },
  reportTopic: { fontSize: 13, color: '#ccc', marginTop: 4 },
  feedbackBox: {
    backgroundColor: '#1a0533',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#6c3de0',
  },
  feedbackLabel: { fontSize: 11, color: '#a78bfa', fontWeight: '700', marginBottom: 4 },
  feedbackText: { fontSize: 13, color: '#ccc' },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  feedbackBtnText: { fontSize: 13, color: '#a78bfa', fontWeight: '600' },
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
  modalSubtitle: { fontSize: 13, color: '#a78bfa', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#1a0533',
    borderWidth: 1,
    borderColor: '#6c3de0',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
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

export default PRLReportsScreen;