import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../../api/index';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [facultyName, setFacultyName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { label: 'Student', value: 'student' },
    { label: 'Lecturer', value: 'lecturer' },
    { label: 'Principal', value: 'prl' },
    { label: 'Leader', value: 'pl'},
  ];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !facultyName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name,
        email,
        password,
        role,
        facultyName,
        studentId,
      });

      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user);
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Diagonal background shapes */}
        <View style={styles.diagonalTop} />
        <View style={styles.diagonalBottom} />

        {/* Welcome text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>CREATE ACCOUNT</Text>
          <Text style={styles.welcomeSubtitle}>
            LUCT Faculty Reporting System
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register</Text>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={18} color="#a78bfa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color="#a78bfa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Faculty Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="school" size={18} color="#a78bfa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Faculty Name"
              placeholderTextColor="#aaa"
              value={facultyName}
              onChangeText={setFacultyName}
            />
          </View>

          {/* Student ID (optional) */}
          <View style={styles.inputContainer}>
            <Ionicons name="card" size={18} color="#a78bfa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Student ID (if applicable)"
              placeholderTextColor="#aaa"
              value={studentId}
              onChangeText={setStudentId}
            />
          </View>

          {/* Role Selector */}
          <Text style={styles.roleLabel}>Select Role</Text>
          <View style={styles.roleContainer}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.roleButton,
                  role === r.value && styles.roleButtonActive,
                ]}
                onPress={() => setRole(r.value)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === r.value && styles.roleButtonTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={18} color="#a78bfa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#a78bfa"
                />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={18} color="#a78bfa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative dots */}
        <View style={styles.dotsTopRight}>
          {[...Array(9)].map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
        <View style={styles.dotsBottomLeft}>
          {[...Array(9)].map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0533',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  diagonalTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.55,
    backgroundColor: '#6c3de0',
    transform: [{ skewY: '-8deg' }, { translateY: -60 }],
    zIndex: 0,
  },
  diagonalBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width * 0.6,
    height: height * 0.4,
    backgroundColor: '#4a1fa8',
    transform: [{ skewY: '-8deg' }],
    zIndex: 0,
    opacity: 0.5,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: '#a855f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#c4b5fd',
    marginTop: 4,
    letterSpacing: 1,
  },
  card: {
    width: width * 0.88,
    backgroundColor: '#12022e',
    borderRadius: 20,
    padding: 28,
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#6c3de0',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#6c3de0',
    marginBottom: 20,
    paddingBottom: 8,
  },
  inputIcon: {
    fontSize: 16,
    color: '#a78bfa',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    paddingVertical: 4,
  },
  showBtn: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
  },
  roleLabel: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  roleContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginBottom: 20,
  gap: 8,
},
roleButton: {
  width: '47%',
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#6c3de0',
  alignItems: 'center',
},
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6c3de0',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#6c3de0',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  roleButtonText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#6c3de0',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#aaa',
    fontSize: 14,
  },
  loginLink: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700',
  },
  dotsTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    gap: 6,
    zIndex: 0,
  },
  dotsBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    gap: 6,
    zIndex: 0,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a78bfa',
    opacity: 0.5,
    margin: 3,
  },
});

export default RegisterScreen;