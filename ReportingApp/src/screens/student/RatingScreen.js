import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createRating } from '../../api/index';

const RatingScreen = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [lecturerUid, setLecturerUid] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!lecturerUid || !lecturerName || !courseCode || !courseName || !rating) {
      Alert.alert('Error', 'Please fill in all fields and select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await createRating({
        lecturerUid,
        lecturerName,
        courseCode,
        courseName,
        rating,
        comment,
      });

      if (response.ratingId) {
        Alert.alert('Success', 'Rating submitted successfully!');
        setLecturerUid('');
        setLecturerName('');
        setCourseCode('');
        setCourseName('');
        setRating(0);
        setComment('');
      } else {
        Alert.alert('Error', response.message || 'Failed to submit rating');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <Ionicons name="star-outline" size={24} color="#a78bfa" />
          <Text style={styles.headerTitle}>Rate Lecturer</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submit a Rating</Text>

          {[
            { label: 'Lecturer ID (UID)', value: lecturerUid, setter: setLecturerUid, placeholder: 'Lecturer unique ID' },
            { label: 'Lecturer Name', value: lecturerName, setter: setLecturerName, placeholder: 'Full name' },
            { label: 'Course Code', value: courseCode, setter: setCourseCode, placeholder: 'e.g. CSC3214' },
            { label: 'Course Name', value: courseName, setter: setCourseName, placeholder: 'e.g. Mobile Programming' },
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

          {/* Star Rating */}
          <Text style={styles.inputLabel}>Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color="#f59e0b"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Comment (optional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitBtnInner}>
                <Ionicons name="star-outline" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Rating</Text>
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
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
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
  multilineInput: { height: 90, textAlignVertical: 'top' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 20, marginTop: 6 },
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

export default RatingScreen;