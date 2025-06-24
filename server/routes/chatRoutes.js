// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/auth');

// Protected routes (require authentication)
router.use(authenticate);

// Get all conversations for a user
router.get('/user/:userId', chatController.getUserConversations);

// Get a single conversation
router.get('/:id', chatController.getConversation);

// Create a new conversation
router.post('/', chatController.createConversation);

// Add a message to a conversation
router.post('/:conversationId/messages', chatController.addMessage);

// Initiate a booking from a conversation
router.post('/:conversationId/booking', chatController.initiateBooking);

// Delete a conversation
router.delete('/:conversationId', chatController.deleteConversation);

module.exports = router;