import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Wishlist.css";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [savedCars, setSavedCars] = useState([]);

  const renterId = "temp-renter-001";

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/wishlist/${renterId}`
      );
      setSavedCars(res.data);
    } catch (err) {
      console.error("Failed to load wishlist:", err.message);
    }
  };

  const removeFromWishlist = async (vehicleId) => {
    try {
      await axios.delete(`http://localhost:5001/api/wishlist/${vehicleId}`);
      fetchWishlist(); // Refresh list
    } catch (err) {
      console.error("Failed to remove vehicle:", err.message);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="wishlist-container">
      <h2>My Saved Vehicles</h2>

      {savedCars.length === 0 ? (
        <p className="empty-wishlist">You haven't saved any vehicles yet.</p>
      ) : (
        <div className="wishlist-grid">
          {savedCars.map((car) => (
            <div className="wishlist-card" key={car._id}>
              <img
                src={`http://localhost:5001/${car.vehicleId?.thumbnail}`}
                alt={car.vehicleId?.name}
              />
              <div className="wishlist-details">
                <h3>{car.vehicleId?.name}</h3>
                <p>LKR {car.vehicleId?.price} / day</p>
                <p>
                  {car.vehicleId?.location} | {car.vehicleId?.type}
                </p>
                <div className="wishlist-actions">
                  <Link to={`/car/${car.vehicleId?._id}`} className="btn-view">
                    View Details
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(car._id)} // 👈 delete using wishlist item ID
                    className="btn-remove"
                  >
                    ❌ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
