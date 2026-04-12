const { db, messaging } = require('../config/firebase');

// Send notification to a single user
const sendNotification = async (req, res) => {
  try {
    const { targetUid, title, body, data } = req.body;

    if (!targetUid || !title || !body) {
      return res.status(400).json({ message: 'targetUid, title and body are required' });
    }

    // Get target user's FCM token from Firestore
    const userDoc = await db.collection('users').doc(targetUid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    if (!userData.fcmToken) {
      return res.status(400).json({ message: 'User has no FCM token registered' });
    }

    const message = {
      token: userData.fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await messaging.send(message);

    // Save notification to Firestore
    await db.collection('notifications').add({
      targetUid,
      title,
      body,
      data: data || {},
      sentBy: req.user.uid,
      sentByName: req.user.name,
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: 'Notification sent successfully',
      response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send notification to multiple users (broadcast)
const sendBroadcastNotification = async (req, res) => {
  try {
    const { role, title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'title and body are required' });
    }

    // Get all users with FCM tokens
    let usersQuery = db.collection('users');
    if (role) {
      usersQuery = usersQuery.where('role', '==', role);
    }

    const usersSnapshot = await usersQuery.get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ message: 'No users found' });
    }

    const tokens = [];
    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'No FCM tokens found' });
    }

    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await messaging.sendEachForMulticast(message);

    // Save broadcast notification to Firestore
    await db.collection('notifications').add({
      targetRole: role || 'all',
      title,
      body,
      data: data || {},
      sentBy: req.user.uid,
      sentByName: req.user.name,
      isBroadcast: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: 'Broadcast notification sent',
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for current user
const getMyNotifications = async (req, res) => {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('targetUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notificationDoc = await db.collection('notifications').doc(id).get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await db.collection('notifications').doc(id).update({
      read: true,
      readAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('targetUid', '==', req.user.uid)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save FCM token for a user
const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    await db.collection('users').doc(req.user.uid).update({
      fcmToken,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notificationDoc = await db.collection('notifications').doc(id).get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await db.collection('notifications').doc(id).delete();

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendNotification,
  sendBroadcastNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  saveFcmToken,
  deleteNotification,
};