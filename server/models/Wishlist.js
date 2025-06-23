const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    renterId: {
      type: String, // Use `ObjectId` if renter accounts are implemented later
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
