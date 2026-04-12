import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://luct-reporting-backend-tdyh.onrender.com/api';

// Helper to get token
const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

// Helper for headers
const getHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// AUTH
export const registerUser = async (data) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const loginUser = async (data) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getProfile = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'GET',
    headers,
  });
  return response.json();
};

// REPORTS
export const createReport = async (data) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getMyReports = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/reports/my-reports?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getAllReports = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/reports?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getReportById = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/reports/${id}`, {
    method: 'GET',
    headers,
  });
  return response.json();
};

export const updateReport = async (id, data) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/reports/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

export const addFeedback = async (id, feedback) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/reports/${id}/feedback`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ feedback }),
  });
  return response.json();
};

export const deleteReport = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/reports/${id}`, {
    method: 'DELETE',
    headers,
  });
  return response.json();
};

// ATTENDANCE
export const markAttendance = async (data) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/attendance`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getMyAttendance = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/attendance/my-attendance?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getAttendanceByCourse = async (courseCode, search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/attendance/course/${courseCode}?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getAllAttendance = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/attendance?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const updateAttendance = async (id, status) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/attendance/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// RATINGS
export const createRating = async (data) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/ratings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getMyRatings = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/ratings/my-ratings?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getLecturerRatings = async (lecturerUid, search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/ratings/lecturer/${lecturerUid}?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getAllRatings = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/ratings?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

export const getMySubmittedRatings = async (search = '') => {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/ratings/my-submitted?search=${search}`,
    { method: 'GET', headers }
  );
  return response.json();
};

// NOTIFICATIONS
export const getMyNotifications = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/notifications/my-notifications`, {
    method: 'GET',
    headers,
  });
  return response.json();
};

export const markNotificationAsRead = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers,
  });
  return response.json();
};

export const markAllNotificationsAsRead = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
    method: 'PUT',
    headers,
  });
  return response.json();
};

export const saveFcmToken = async (fcmToken) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/notifications/save-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fcmToken }),
  });
  return response.json();
};

export const sendNotification = async (data) => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/notifications/send`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};