const Conversation = require('../models/conversation');
const Vehicle = require('../models/vehicle');
const User = require('../models/user');
const mongoose = require('mongoose');
const { analyzeMessageIntent } = require('../services/aiService');

// Get all conversations for a user (either owner or renter)
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Find all conversations where the user is either owner or renter
    const conversations = await Conversation.find({
      $or: [
        { owner: userId },
        { renter: userId }
      ]
    })
    .populate({
      path: 'vehicle',
      select: 'name brand price thumbnail location'
    })
    .populate({
      path: 'owner',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'renter',
      select: 'firstName lastName email'
    })
    .sort({ updatedAt: -1 });
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single conversation by ID
exports.getConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }
    
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'vehicle',
        select: 'name brand price thumbnail location owner'
      })
      .populate({
        path: 'owner',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'renter',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'messages.sender.userId',
        select: 'firstName lastName email'
      });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const userId = req.user.id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: 'Invalid vehicle ID' });
    }
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if a conversation already exists between this user and vehicle owner
    const existingConversation = await Conversation.findOne({
      vehicle: vehicleId,
      renter: userId,
      owner: vehicle.owner
    });
    
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }
    
    // Create a new conversation
    const newConversation = new Conversation({
      vehicle: vehicleId,
      owner: vehicle.owner,
      renter: userId,
      messages: []
    });
    
    await newConversation.save();
    
    // Populate the saved conversation with related data
    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate({
        path: 'vehicle',
        select: 'name brand price thumbnail location'
      })
      .populate({
        path: 'owner',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'renter',
        select: 'firstName lastName email'
      });
    
    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a message to a conversation
exports.addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, type = 'text' } = req.body;
    const userId = req.user.id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    if (conversation.owner.toString() !== userId && conversation.renter.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to message in this conversation' });
    }
    
    // Get user data
    const user = await User.findById(userId).select('firstName lastName role');
    
    // Create message object
    const message = {
      text,
      type,
      timestamp: new Date(),
      sender: {
        userId,
        name: `${user.firstName} ${user.lastName}`,
        userType: conversation.owner.toString() === userId ? 'owner' : 'renter'
      }
    };
    
    // Add message to conversation
    conversation.messages.push(message);
    conversation.lastMessage = text;
    conversation.updatedAt = new Date();
    
    await conversation.save();
    
    // Analyze message intent with AI if it's from a renter
    if (conversation.renter.toString() === userId) {
      try {
        // This would be an async call to your AI service
        analyzeMessageIntent(text, conversation._id, userId);
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Don't fail the request if AI analysis fails
      }
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a booking from a conversation
exports.initiateBooking = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }
    
    const conversation = await Conversation.findById(conversationId)
      .populate('vehicle');
      
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is the renter in this conversation
    if (conversation.renter.toString() !== userId) {
      return res.status(403).json({ message: 'Only renters can initiate bookings' });
    }
    
    // Here you would integrate with your booking system
    // For now we'll just create a system message in the conversation
    
    const systemMessage = {
      text: `Booking initiated for ${conversation.vehicle.brand} ${conversation.vehicle.name} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      type: 'system',
      timestamp: new Date(),
      bookingData: {
        startDate,
        endDate,
        vehicle: conversation.vehicle._id,
        initiatedAt: new Date()
      }
    };
    
    conversation.messages.push(systemMessage);
    conversation.lastMessage = systemMessage.text;
    conversation.updatedAt = new Date();
    
    await conversation.save();
    
    res.status(201).json({
      message: 'Booking initiated successfully',
      bookingData: systemMessage.bookingData
    });
  } catch (error) {
    console.error('Error initiating booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a conversation (soft delete)
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    if (conversation.owner.toString() !== userId && conversation.renter.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }
    
    // Soft delete by marking as deleted for this user
    if (conversation.owner.toString() === userId) {
      conversation.ownerDeleted = true;
    } else {
      conversation.renterDeleted = true;
    }
    
    // If both users have deleted, we could hard delete or archive
    if (conversation.ownerDeleted && conversation.renterDeleted) {
      // Optional: await Conversation.findByIdAndDelete(conversationId);
      conversation.archived = true;
    }
    
    await conversation.save();
    
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
