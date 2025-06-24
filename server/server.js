const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const path = require("path");
const bodyParser = require("body-parser");

// Load environment variables - fix path to .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// App setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// ======= MongoDB Connection =======
const MONGODB_URI = process.env.MONGODB_URI;

// Add debug logging to check if the MongoDB URI is loaded correctly
console.log("MongoDB URI loaded:", MONGODB_URI ? "Yes" : "No");

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message || err)
  );

// ======= Middleware =======
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======= Routes =======
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/BookingRoutes"));
app.use("/api/notifications", require("./routes/BookingRoutes"));
app.use("/api/wishlist", require("./routes/WishlistRoutes"));
app.use("/api/auth", authRoutes);

// ======= Static Files =======
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======= Root Test =======
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ======= Socket.IO Chat =======
const Vehicle = require("./models/Vehicle");
const Booking = require("./models/Booking");
const ConversationAnalyzer = require("./services/ConversationAnalyzer");

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

const conversationAnalyzer = new ConversationAnalyzer();
const activeConversations = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join_conversation", ({ conversationId, userId, userType }) => {
    socket.join(conversationId);

    if (!activeConversations.has(conversationId)) {
      activeConversations.set(conversationId, {
        participants: {},
        messages: [],
        vehicleId: null
      });
    }

    const conversation = activeConversations.get(conversationId);
    conversation.participants[socket.id] = { userId, userType };

    console.log(`${userType} joined conversation: ${conversationId}`);
  });

  socket.on("send_message", async (messageData) => {
    const { conversationId, message, sender, vehicleId } = messageData;
    const conversation = activeConversations.get(conversationId);
    if (conversation) {
      if (!conversation.vehicleId && vehicleId) {
        conversation.vehicleId = vehicleId;
      }

      const newMessage = { ...message, sender, timestamp: new Date() };
      conversation.messages.push(newMessage);

      io.to(conversationId).emit("receive_message", newMessage);

      if (conversation.messages.length >= 3) {
        const result = await conversationAnalyzer.analyzeConversation(
          conversation.messages
        );

        if (result.intent === "booking_intent") {
          const vehicleDetails = await getVehicleDetails(conversation.vehicleId);
          const bookingSuggestion = {
            type: "booking_suggestion",
            vehicleDetails,
            suggestedDates: result.suggestedDates,
            message: "I notice you're interested in booking this vehicle. Would you like to proceed?"
          };
          io.to(conversationId).emit("ai_suggestion", bookingSuggestion);
        }
      }
    }
  });

  socket.on("initiate_booking", async ({ conversationId, bookingDetails }) => {
    try {
      const bookingId = await createBooking(bookingDetails);
      io.to(conversationId).emit("booking_created", {
        bookingId,
        details: bookingDetails,
        message: "Booking has been initiated successfully!"
      });
    } catch (error) {
      console.error("❌ Booking creation failed:", error);
      socket.emit("booking_error", {
        message: "Failed to create booking. Please try again.",
        error: error.message
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [conversationId, data] of activeConversations.entries()) {
      if (data.participants[socket.id]) {
        delete data.participants[socket.id];
        if (Object.keys(data.participants).length === 0) {
          activeConversations.delete(conversationId);
        }
      }
    }
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ======= Helper Functions =======
async function getVehicleDetails(vehicleId) {
  try {
    const vehicle = await Vehicle.findById(vehicleId).populate("owner", "firstName lastName email");
    if (!vehicle) throw new Error("Vehicle not found");

    return {
      id: vehicle._id,
      name: `${vehicle.brand} ${vehicle.name}`,
      price: vehicle.price,
      location: vehicle.location,
      type: vehicle.type,
      thumbnail: vehicle.thumbnail || vehicle.images[0],
      owner: vehicle.owner ? `${vehicle.owner.firstName} ${vehicle.owner.lastName}` : "Unknown"
    };
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    return null;
  }
}

async function createBooking(bookingDetails) {
  try {
    const { vehicleId, userId, dates } = bookingDetails;
    const newBooking = new Booking({
      vehicleId,
      renterId: userId,
      startDate: dates.startDate,
      endDate: dates.endDate,
      status: "pending",
      createdVia: "ai_chat"
    });
    const savedBooking = await newBooking.save();
    return savedBooking._id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

// ======= Start Server =======
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
