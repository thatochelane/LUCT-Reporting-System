const express = require('express');
const router = express.Router();
const {
  sendNotification,
  sendBroadcastNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  saveFcmToken,
  deleteNotification,
} = require('../controllers/notificationController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// All users
router.get('/my-notifications', verifyToken, getMyNotifications);
router.put('/mark-all-read', verifyToken, markAllAsRead);
router.put('/:id/read', verifyToken, markAsRead);
router.post('/save-token', verifyToken, saveFcmToken);
router.delete('/:id', verifyToken, deleteNotification);

// PRL only
router.post('/send', verifyToken, verifyRole('prl'), sendNotification);
router.post('/broadcast', verifyToken, verifyRole('prl'), sendBroadcastNotification);

module.exports = router;