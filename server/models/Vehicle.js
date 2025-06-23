const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  brand: String,
  price: Number,
  type: String,
  seats: Number,
  location: String,
  description: String,
  images: [String],
  thumbnail: String,
  createdAt: { type: Date, default: Date.now },
  // Approval system additions
  status: {
    type: String,
    enum: ["pending", "approved", "rejected","Available"],
    default: "pending"
  },
  ownerEmail: { type: String, required: true },
  
});

module.exports = mongoose.model("Vehicle", vehicleSchema);