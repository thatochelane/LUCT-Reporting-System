const { auth, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Register
const register = async (req, res) => {
  try {
    const { email, password, name, role, facultyName, studentId } = req.body;

    // Validate role
    const allowedRoles = ['student', 'lecturer', 'prl'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Save user details in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role,
      facultyName: facultyName || '',
      studentId: studentId || '',
      createdAt: new Date().toISOString(),
    });

    // Generate JWT
    const token = jwt.sign(
      { uid: userRecord.uid, email, role, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { uid: userRecord.uid, email, name, role },
    });
  } catch (error) {
  console.error('REGISTER ERROR:', error.message);
  if (error.errorInfo?.code === 'auth/email-already-exists') {
    return res.status(400).json({ message: 'This email is already registered. Please login instead.' });
  }
  res.status(500).json({ message: error.message });
}
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from Firestore by email
    const usersSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = usersSnapshot.docs[0].data();

    // Verify password via Firebase Auth REST API
    const fetch = require('node-fetch');
    const firebaseApiKey = process.env.FIREBASE_API_KEY;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const firebaseData = await response.json();

    if (firebaseData.error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile };