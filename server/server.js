const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require('./routes/auth');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
// Create HTTP server using Express app
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // or use '*' for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/api/vehicles", vehicleRoutes);

const bookingRoutes = require("./routes/BookingRoutes");
app.use("/api/bookings", bookingRoutes);

const notificationRoutes = require("./routes/BookingRoutes");
app.use("/api/notifications", notificationRoutes);

const wishlistRoutes = require("./routes/WishlistRoutes");
app.use("/api/wishlist", wishlistRoutes);

app.use('/api/auth', authRoutes);

// Static files
app.use("/uploads", express.static("uploads"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple test route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ==================== SOCKET.IO CHAT SYSTEM ====================

// Load required models
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');
const ConversationAnalyzer = require('./services/ConversationAnalyzer');

// Initialize conversation analyzer
const conversationAnalyzer = new ConversationAnalyzer();

// Track active conversations
const activeConversations = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a conversation room
  socket.on('join_conversation', ({ conversationId, userId, userType }) => {
    socket.join(conversationId);
    
    // Initialize conversation tracking if needed
    if (!activeConversations.has(conversationId)) {
      activeConversations.set(conversationId, {
        participants: {},
        messages: [],
        vehicleId: null
      });
    }
    
    // Add participant info
    const conversation = activeConversations.get(conversationId);
    conversation.participants[socket.id] = { userId, userType };
    
    console.log(`${userType} joined conversation: ${conversationId}`);
  });
  
  // Handle new messages
  socket.on('send_message', async (messageData) => {
    const { conversationId, message, sender, vehicleId } = messageData;
    
    // Store message
    const conversation = activeConversations.get(conversationId);
    if (conversation) {
      // Add vehicle ID if first message
      if (!conversation.vehicleId && vehicleId) {
        conversation.vehicleId = vehicleId;
      }
      
      // Add message to conversation history
      const newMessage = { ...message, sender, timestamp: new Date() };
      conversation.messages.push(newMessage);
      
      // Broadcast message to conversation room
      io.to(conversationId).emit('receive_message', newMessage);
      
      // Analyze conversation after new message
      if (conversation.messages.length >= 3) {
        const result = await conversationAnalyzer.analyzeConversation(conversation.messages);
        
        if (result.intent === 'booking_intent') {
          // Fetch vehicle details
          const vehicleDetails = await getVehicleDetails(conversation.vehicleId);
          
          // Generate booking suggestion
          const bookingSuggestion = {
            type: 'booking_suggestion',
            vehicleDetails,
            suggestedDates: result.suggestedDates,
            message: "I notice you're interested in booking this vehicle. Would you like to proceed?"
          };
          
          // Send AI suggestion to the conversation
          io.to(conversationId).emit('ai_suggestion', bookingSuggestion);
        }
      }
    }
  });
  
  // Handle booking initiation
  socket.on('initiate_booking', async ({ conversationId, bookingDetails }) => {
    try {
      // Process booking using your existing Booking model
      const bookingId = await createBooking(bookingDetails);
      
      // Notify all participants
      io.to(conversationId).emit('booking_created', {
        bookingId,
        details: bookingDetails,
        message: "Booking has been initiated successfully!"
      });
    } catch (error) {
      console.error("Booking creation failed:", error);
      socket.emit('booking_error', { 
        message: "Failed to create booking. Please try again.",
        error: error.message
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Clean up participant data
    for (const [conversationId, data] of activeConversations.entries()) {
      if (data.participants[socket.id]) {
        delete data.participants[socket.id];
        
        // Remove conversation if empty
        if (Object.keys(data.participants).length === 0) {
          activeConversations.delete(conversationId);
        }
      }
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to get vehicle details from your database
async function getVehicleDetails(vehicleId) {
  try {
    const vehicle = await Vehicle.findById(vehicleId)
      .populate('owner', 'firstName lastName email');
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return {
      id: vehicle._id,
      name: `${vehicle.brand} ${vehicle.name}`,
      price: vehicle.price,
      location: vehicle.location,
      type: vehicle.type,
      thumbnail: vehicle.thumbnail || vehicle.images[0],
      owner: vehicle.owner ? `${vehicle.owner.firstName} ${vehicle.owner.lastName}` : 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    return null;
  }
}

// Helper function to create a booking in your database
async function createBooking(bookingDetails) {
  try {
    const { vehicleId, userId, dates } = bookingDetails;
    
    const newBooking = new Booking({
      vehicleId,
      renterId: userId,
      startDate: dates.startDate,
      endDate: dates.endDate,
      status: 'pending',
      createdVia: 'ai_chat'
    });
    
    const savedBooking = await newBooking.save();
    
    // Send notification or update other related models as needed
    // ...
    
    return savedBooking._id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// Start server (using the http server instead of Express app directly)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});