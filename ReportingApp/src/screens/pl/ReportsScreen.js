import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports } from '../../api/index';

const PLReportsScreen = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getAllReports();
      if (response.reports) {
        setReports(response.reports);
        setFiltered(response.reports);
      }
    } catch (error) {
      console.log('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const searchLower = text.toLowerCase();
    setFiltered(
      reports.filter(r =>
        r.courseName.toLowerCase().includes(searchLower) ||
        r.courseCode.toLowerCase().includes(searchLower) ||
        r.lecturerName.toLowerCase().includes(searchLower) ||
        r.className.toLowerCase().includes(searchLower) ||
        r.facultyName.toLowerCase().includes(searchLower)
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Reports</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>{loading ? '...' : String(reports.length)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String(reports.filter(r => r.status === 'reviewed').length)}
            </Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="hourglass-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String(reports.filter(r => r.status === 'pending').length)}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>Reports will appear here</Text>
          </View>
        ) : (
          filtered.map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <Text style={styles.reportCourse}>{report.courseName}</Text>
                  <Text style={styles.reportCode}>{report.courseCode}</Text>
                </View>
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
              <Text style={styles.reportDetail}>
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
                  <Text style={styles.feedbackLabel}>PRL Feedback:</Text>
                  <Text style={styles.feedbackText}>{report.feedback}</Text>
                </View>
              ) : null}
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
  reportCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 14,
    gap: 6,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportHeaderLeft: { flex: 1 },
  reportCourse: { fontSize: 15, fontWeight: '700', color: '#fff' },
  reportCode: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
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
  bottomSpacing: { height: 30 },
});

export default PLReportsScreen;