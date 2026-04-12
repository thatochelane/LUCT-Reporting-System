import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllRatings } from '../../api/index';

const PRLRatingScreen = ({ user }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await getAllRatings(search);
      if (response.ratings) setRatings(response.ratings);
    } catch (error) {
      console.log('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={12}
        color="#f59e0b"
      />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="star-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>All Ratings</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by lecturer or course..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={(text) => { setSearch(text); fetchRatings(); }}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : ratings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Ratings Found</Text>
            <Text style={styles.emptySubtitle}>All lecturer ratings will appear here</Text>
          </View>
        ) : (
          ratings.map((rating, index) => (
            <View key={index} style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                <Text style={styles.lecturerName}>{rating.lecturerName}</Text>
                <View style={styles.starsRow}>
                  {renderStars(rating.rating)}
                </View>
              </View>
              <Text style={styles.courseInfo}>{rating.courseName} · {rating.courseCode}</Text>
              <Text style={styles.studentInfo}>By: {rating.studentName}</Text>
              {rating.comment ? (
                <Text style={styles.comment}>"{rating.comment}"</Text>
              ) : null}
              <Text style={styles.date}>{new Date(rating.createdAt).toLocaleDateString()}</Text>
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
  ratingCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 12,
    gap: 4,
  },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lecturerName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  starsRow: { flexDirection: 'row', gap: 2 },
  courseInfo: { fontSize: 12, color: '#a78bfa' },
  studentInfo: { fontSize: 12, color: '#888' },
  comment: { fontSize: 13, color: '#ccc', fontStyle: 'italic', marginTop: 4 },
  date: { fontSize: 11, color: '#555', marginTop: 4 },
  bottomSpacing: { height: 30 },
});

export default PRLRatingScreen;