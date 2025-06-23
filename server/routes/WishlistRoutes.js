const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/WishlistController");

router.get("/:renterId", getWishlist); // Get wishlist by renter
router.post("/", addToWishlist); // Add new vehicle to wishlist
router.delete("/:id", removeFromWishlist); // Remove by wishlist item ID

module.exports = router;
