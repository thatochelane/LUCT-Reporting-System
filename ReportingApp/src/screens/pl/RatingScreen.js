import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllRatings } from '../../api/index';

const PLRatingScreen = ({ user }) => {
  const [ratings, setRatings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [avgRating, setAvgRating] = useState('0.0');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await getAllRatings();
      if (response.ratings) {
        setRatings(response.ratings);
        setFiltered(response.ratings);
        if (response.ratings.length > 0) {
          const avg = response.ratings.reduce((sum, r) => sum + r.rating, 0) / response.ratings.length;
          setAvgRating(avg.toFixed(1));
        }
      }
    } catch (error) {
      console.log('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const searchLower = text.toLowerCase();
    setFiltered(
      ratings.filter(r =>
        r.lecturerName.toLowerCase().includes(searchLower) ||
        r.courseName.toLowerCase().includes(searchLower) ||
        r.courseCode.toLowerCase().includes(searchLower) ||
        r.studentName.toLowerCase().includes(searchLower)
      )
    );
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

        {/* Average Rating Card */}
        <View style={styles.averageCard}>
          <Text style={styles.averageNumber}>{avgRating}</Text>
          <View style={styles.starsRow}>
            {renderStars(Math.round(avgRating))}
          </View>
          <Text style={styles.averageLabel}>
            Overall Average · {ratings.length} ratings
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String([...new Set(ratings.map(r => r.lecturerUid))].length)}
            </Text>
            <Text style={styles.statLabel}>Lecturers Rated</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="person-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String([...new Set(ratings.map(r => r.studentUid))].length)}
            </Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="library-outline" size={20} color="#a78bfa" />
            <Text style={styles.statNumber}>
              {loading ? '...' : String([...new Set(ratings.map(r => r.courseCode))].length)}
            </Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ratings..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#a78bfa" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Ratings Found</Text>
            <Text style={styles.emptySubtitle}>Student ratings will appear here</Text>
          </View>
        ) : (
          filtered.map((rating, index) => (
            <View key={index} style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                <Text style={styles.lecturerName}>{rating.lecturerName}</Text>
                <View style={styles.starsRow}>
                  {renderStars(rating.rating)}
                </View>
              </View>
              <Text style={styles.courseInfo}>
                {rating.courseName} · {rating.courseCode}
              </Text>
              <Text style={styles.studentInfo}>
                <Ionicons name="person-outline" size={12} color="#888" /> By: {rating.studentName}
              </Text>
              {rating.comment ? (
                <Text style={styles.comment}>"{rating.comment}"</Text>
              ) : null}
              <Text style={styles.date}>
                {new Date(rating.createdAt).toLocaleDateString()}
              </Text>
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
  statNumber: { fontSize: 20, fontWeight: '800', color: '#a78bfa' },
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
  ratingCard: {
    backgroundColor: '#12022e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c3de0',
    marginBottom: 12,
    gap: 4,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lecturerName: { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 },
  courseInfo: { fontSize: 12, color: '#a78bfa' },
  studentInfo: { fontSize: 12, color: '#888' },
  comment: { fontSize: 13, color: '#ccc', fontStyle: 'italic', marginTop: 4 },
  date: { fontSize: 11, color: '#555', marginTop: 4 },
  bottomSpacing: { height: 30 },
});

export default PLRatingScreen;