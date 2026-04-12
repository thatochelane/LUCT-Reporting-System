import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Student Screens
import StudentDashboard from '../screens/student/StudentDashboard';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import MonitoringScreen from '../screens/student/MonitoringScreen';
import RatingScreen from '../screens/student/RatingScreen';

// Lecturer Screens
import LecturerDashboard from '../screens/lecturer/LecturerDashboard';
import ReportFormScreen from '../screens/lecturer/ReportFormScreen';
import ClassesScreen from '../screens/lecturer/ClassesScreen';
import LecturerMonitoringScreen from '../screens/lecturer/MonitoringScreen';
import LecturerRatingScreen from '../screens/lecturer/RatingScreen';
import StudentAttendanceScreen from '../screens/lecturer/StudentAttendanceScreen';

// PRL Screens
import PRLDashboard from '../screens/prl/PRLDashboard';
import PRLCoursesScreen from '../screens/prl/CoursesScreen';
import PRLReportsScreen from '../screens/prl/ReportsScreen';
import PRLMonitoringScreen from '../screens/prl/MonitoringScreen';
import PRLRatingScreen from '../screens/prl/RatingScreen';
import PRLClassesScreen from '../screens/prl/ClassesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ label, focused }) => {
  const icons = {
    Home: 'home',
    Attendance: 'calendar',
    Monitoring: 'stats-chart',
    Rating: 'star',
    Classes: 'book',
    Reports: 'document-text',
    Students: 'people',
    Courses: 'school',
  };

  return (
    <View style={styles.tabIcon}>
      <Ionicons
        name={icons[label] || 'document'}
        size={28}
        color={focused ? '#a78bfa' : '#666'}
      />
      
    </View>
  );
};

// STUDENT TABS 
const StudentTabs = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
    >
      {({ navigation }) => <StudentDashboard user={user} onLogout={onLogout} navigation={navigation} />}
    </Tab.Screen>
    <Tab.Screen
      name="Attendance"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Attendance" focused={focused} /> }}
    >
      {() => <AttendanceScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Monitoring"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Monitoring" focused={focused} /> }}
    >
      {() => <MonitoringScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Rating"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Rating" focused={focused} /> }}
    >
      {() => <RatingScreen user={user} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// LECTURER TABS 
const LecturerTabs = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
    >
      {({ navigation }) => <LecturerDashboard user={user} onLogout={onLogout} navigation={navigation} />}
    </Tab.Screen>
    <Tab.Screen
      name="Classes"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Classes" focused={focused} /> }}
    >
      {() => <ClassesScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Reports"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Reports" focused={focused} /> }}
    >
      {() => <ReportFormScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Students"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Students" focused={focused} /> }}
    >
      {() => <StudentAttendanceScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Monitoring"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Monitoring" focused={focused} /> }}
    >
      {() => <LecturerMonitoringScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Rating"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Rating" focused={focused} /> }}
    >
      {() => <LecturerRatingScreen user={user} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// PRL TABS 
const PRLTabs = ({ user, onLogout }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
    >
      {({ navigation }) => <PRLDashboard user={user} onLogout={onLogout} navigation={navigation} />}
    </Tab.Screen>
    <Tab.Screen
      name="Courses"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Courses" focused={focused} /> }}
    >
      {() => <PRLCoursesScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Reports"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Reports" focused={focused} /> }}
    >
      {() => <PRLReportsScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Monitoring"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Monitoring" focused={focused} /> }}
    >
      {() => <PRLMonitoringScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Classes"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Classes" focused={focused} /> }}
    >
      {() => <PRLClassesScreen user={user} />}
    </Tab.Screen>
    <Tab.Screen
      name="Rating"
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Rating" focused={focused} /> }}
    >
      {() => <PRLRatingScreen user={user} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// AUTH STACK
const AuthStack = ({ onLogin }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login">
      {(props) => <LoginScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
    <Stack.Screen name="Register">
      {(props) => <RegisterScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

// MAIN NAVIGATOR
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const savedToken = await AsyncStorage.getItem('token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c3de0" />
      </View>
    );
  }

  const renderTabs = () => {
    if (!user) return <AuthStack onLogin={handleLogin} />;
    if (user.role === 'student') return <StudentTabs user={user} onLogout={handleLogout} />;
    if (user.role === 'lecturer') return <LecturerTabs user={user} onLogout={handleLogout} />;
    if (user.role === 'prl') return <PRLTabs user={user} onLogout={handleLogout} />;
    return <AuthStack onLogin={handleLogin} />;
  };

  return (
    <NavigationContainer>
      {renderTabs()}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0533',
  },
  tabBar: {
    backgroundColor: '#12022e',
    borderTopWidth: 1,
    borderTopColor: '#6c3de0',
    height: 85,
    paddingBottom: 2,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0.5,
  },
});

export default AppNavigator;