const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    renterName: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed','approved'],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
