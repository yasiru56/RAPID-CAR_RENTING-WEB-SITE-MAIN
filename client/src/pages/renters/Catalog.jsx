import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import "./Catalog.css";

const renterId = "temp-renter-001"; // Placeholder until auth

export default function Catalog() {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [filters, setFilters] = useState({
    location: "",
    type: "",
    maxPrice: "",
    search: "",
  });

  const [searchParams] = useSearchParams();
  const locationQuery = searchParams.get("location") || "";
  const typeQuery = searchParams.get("type") || "";

  useEffect(() => {
    fetchVehicles();
    fetchWishlist();
  }, [locationQuery, typeQuery]);

  // 📥 Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/vehicles");
      const all = res.data;
      setVehicles(all);

      const autoFiltered = all.filter((v) => {
        const matchLocation = locationQuery
          ? v.location.toLowerCase() === locationQuery.toLowerCase()
          : true;
        const matchType = typeQuery
          ? v.type.toLowerCase() === typeQuery.toLowerCase()
          : true;
        return matchLocation && matchType;
      });

      setFiltered(autoFiltered);
      setFilters((prev) => ({
        ...prev,
        location: locationQuery,
        type: typeQuery,
      }));
    } catch (err) {
      console.error("❌ Failed to fetch vehicles:", err);
    }
  };

  // 💾 Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/wishlist/${renterId}`
      );
      setWishlist(res.data); // Full wishlist objects (with _id and vehicleId)
    } catch (err) {
      console.error("❌ Failed to fetch wishlist:", err);
    }
  };

  // ➕ Save to wishlist
  const handleSave = async (vehicleId) => {
    try {
      const res = await axios.post("http://localhost:5001/api/wishlist", {
        renterId,
        vehicleId,
      });
      setWishlist((prev) => [...prev, res.data]); // push full object returned from backend
    } catch (err) {
      console.error("❌ Failed to save vehicle:", err);
    }
  };

  // ❌ Remove from wishlist
  const handleRemove = async (vehicleId) => {
    const match = wishlist.find(
      (item) =>
        String(item?.vehicleId?._id || item?.vehicleId) === String(vehicleId)
    );

    if (!match) return;

    try {
      await axios.delete(`http://localhost:5001/api/wishlist/${match._id}`);
      setWishlist((prev) => prev.filter((item) => item._id !== match._id));
    } catch (err) {
      console.error("❌ Failed to remove vehicle from wishlist:", err);
    }
  };

  // 🔍 Filter logic
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);

    const result = vehicles.filter((v) => {
      const matchLocation = v.location
        .toLowerCase()
        .includes(updatedFilters.location.toLowerCase());
      const matchType = updatedFilters.type
        ? v.type.toLowerCase() === updatedFilters.type.toLowerCase()
        : true;
      const matchPrice = updatedFilters.maxPrice
        ? parseInt(v.price) <= parseInt(updatedFilters.maxPrice)
        : true;
      const matchSearch = updatedFilters.search
        ? v.name.toLowerCase().includes(updatedFilters.search.toLowerCase())
        : true;

      return matchLocation && matchType && matchPrice && matchSearch;
    });

    setFiltered(result);
  };

  // ❤️ Helper to check wishlist
  const isWishlisted = (vehicleId) => {
    return wishlist.some(
      (item) =>
        String(item?.vehicleId?._id || item?.vehicleId) === String(vehicleId)
    );
  };

  return (
    <div className="catalog-container">
      <h2>Browse Vehicles</h2>

      {/* 🔎 Filters */}
      <div className="filter-bar">
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Car">Car</option>
          <option value="Van">Van</option>
        </select>
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price (LKR)"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
      </div>

      {/* 🚗 Vehicle Cards */}
      <div className="vehicle-grid">
        {filtered.length > 0 ? (
          filtered.map((v) => (
            <div className="vehicle-card" key={v._id}>
              <Link to={`/car/${v._id}`}>
                <img
                  src={`http://localhost:5001/${v.thumbnail}`}
                  alt={v.name}
                  className="vehicle-img"
                />
              </Link>

              <div className="vehicle-info">
                <h3>{v.name}</h3>
                <p>LKR {v.price} / day</p>
                <p>
                  <strong>Type:</strong> {v.type}
                </p>
                <p>
                  <strong>Location:</strong> {v.location}
                </p>

                <Link to={`/car/${v._id}`}>
                  <button className="btn-book">View Details</button>
                </Link>

                {isWishlisted(v._id) ? (
                  <button
                    className="btn-remove"
                    onClick={() => handleRemove(v._id)}
                  >
                    ❌ Remove from Wishlist
                  </button>
                ) : (
                  <button
                    className="btn-save"
                    onClick={() => handleSave(v._id)}
                  >
                    Save to Wishlist
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No vehicles match your filters.</p>
        )}
      </div>
    </div>
  );
}
