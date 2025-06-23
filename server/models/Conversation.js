const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['renter', 'owner', 'admin', 'system'],
      required: true
    },
    name: String
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['text', 'image', 'system', 'booking'],
    default: 'text'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

const aiSuggestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['booking_suggestion', 'discount_suggestion', 'date_change', 'general'],
    required: true
  },
  message: String,
  suggestedDates: [String],
  shown: {
    type: Boolean,
    default: false
  },
  accepted: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  bookingData: {
    type: mongoose.Schema.Types.Mixed
  }
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['renter', 'owner', 'admin'],
      required: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  messages: [messageSchema],
  aiSuggestions: [aiSuggestionSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'booking_created', 'deleted'],
    default: 'active'
  },
  relatedBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ participants: 1, vehicle: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ status: 1 });

// Method to add a new message
conversationSchema.methods.addMessage = function(sender, message) {
  this.messages.push({
    sender,
    text: message,
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to record that a user has seen the conversation
conversationSchema.methods.markAsSeenBy = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.lastSeen = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if there are unread messages for a user
conversationSchema.methods.hasUnreadMessages = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (!participant) return false;
  
  return this.messages.some(message => 
    message.timestamp > participant.lastSeen && 
    message.sender.userId.toString() !== userId.toString()
  );
};

// Static method to find or create a conversation
conversationSchema.statics.findOrCreateConversation = async function(renterUserId, ownerUserId, vehicleId) {
  // First try to find an existing conversation
  let conversation = await this.findOne({
    'participants.userId': { $all: [renterUserId, ownerUserId] },
    vehicle: vehicleId
  });
  
  // If no conversation exists, create a new one
  if (!conversation) {
    conversation = new this({
      participants: [
        { userId: renterUserId, userType: 'renter' },
        { userId: ownerUserId, userType: 'owner' }
      ],
      vehicle: vehicleId,
      messages: []
    });
    await conversation.save();
  }
  
  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;