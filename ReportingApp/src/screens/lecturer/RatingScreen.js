import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyRatings } from '../../api/index';

const LecturerRatingScreen = ({ user }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [average, setAverage] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await getMyRatings(search);
      if (response.ratings) {
        setRatings(response.ratings);
        setAverage(response.averageRating);
      }
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
        size={14}
        color="#f59e0b"
      />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Ionicons name="star-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>My Ratings</Text>
        </View>

        {/* Average Rating Card */}
        <View style={styles.averageCard}>
          <Text style={styles.averageNumber}>{average || '0.0'}</Text>
          <View style={styles.starsRow}>
            {renderStars(Math.round(average))}
          </View>
          <Text style={styles.averageLabel}>Average Rating · {ratings.length} reviews</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ratings..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Ratings List */}
        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : ratings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Ratings Yet</Text>
            <Text style={styles.emptySubtitle}>Student ratings will appear here</Text>
          </View>
        ) : (
          ratings.map((rating, index) => (
            <View key={index} style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingCourse}>{rating.courseName}</Text>
                <View style={styles.starsRow}>
                  {renderStars(rating.rating)}
                </View>
              </View>
              <Text style={styles.ratingCode}>{rating.courseCode}</Text>
              {rating.comment ? (
                <Text style={styles.ratingComment}>"{rating.comment}"</Text>
              ) : null}
              <Text style={styles.ratingDate}>{new Date(rating.createdAt).toLocaleDateString()}</Text>
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
  averageCard: {
    backgroundColor: '#12022e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 20,
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  averageNumber: { fontSize: 48, fontWeight: '900', color: '#a78bfa' },
  starsRow: { flexDirection: 'row', gap: 4 },
  averageLabel: { fontSize: 13, color: '#888' },
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
    gap: 6,
  },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingCourse: { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 },
  ratingCode: { fontSize: 12, color: '#a78bfa' },
  ratingComment: { fontSize: 13, color: '#ccc', fontStyle: 'italic', marginTop: 4 },
  ratingDate: { fontSize: 11, color: '#555', marginTop: 4 },
  bottomSpacing: { height: 30 },
});

export default LecturerRatingScreen;