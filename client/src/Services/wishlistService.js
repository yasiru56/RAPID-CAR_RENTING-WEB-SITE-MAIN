import axios from "axios";

const API = "http://localhost:5001/api/wishlist";

// Temporarily hardcode renter ID (until auth is ready)
const renterId = "demo-renter-id-123";

export const addToWishlist = (vehicleId) =>
  axios.post(API, { vehicleId, renterId });

export const getWishlist = () => axios.get(`${API}/renter/${renterId}`);

export const removeFromWishlist = (vehicleId) =>
  axios.delete(`${API}/${vehicleId}/renter/${renterId}`);
