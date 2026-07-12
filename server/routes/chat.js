const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, chatController.getConversations);
router.get('/unread-count', authenticate, chatController.getUnreadCount);
router.get('/messages/:userId', authenticate, chatController.getMessages);
router.post('/messages', authenticate, chatController.sendMessage);
router.put('/read/:userId', authenticate, chatController.markAsRead);

module.exports = router;
