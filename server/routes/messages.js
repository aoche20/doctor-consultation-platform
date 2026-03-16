const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getConversation);
router.put('/read/:senderId', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;