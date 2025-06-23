const Wishlist = require("../models/wishlist");
const Vehicle = require("../models/Vehicle");

// GET all saved vehicles for a renter
exports.getWishlist = async (req, res) => {
  const { renterId } = req.params;
  try {
    const wishlist = await Wishlist.find({ renterId }).populate("vehicleId");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: err });
  }
};

// ADD to wishlist
exports.addToWishlist = async (req, res) => {
  const { renterId, vehicleId } = req.body;

  console.log("👉 Incoming Wishlist Add:", req.body); // Already exists
  console.log("✅ renterId:", renterId, "✅ vehicleId:", vehicleId); // 👈 ADD THIS

  if (!renterId || !vehicleId) {
    return res.status(400).json({ message: "Missing renterId or vehicleId" });
  }

  try {
    const exists = await Wishlist.findOne({ renterId, vehicleId });
    if (exists) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    const item = await Wishlist.create({ renterId, vehicleId });
    res.status(201).json(item);
  } catch (err) {
    console.error("❌ Wishlist Add Error:", err.message);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
};

// DELETE from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { id } = req.params;
  try {
    await Wishlist.findByIdAndDelete(id);
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item", error: err });
  }
};
