import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyBooking.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/bookings");
        setBookings(res.data);
      } catch (err) {
        console.error(
          "❌ Error fetching bookings:",
          err.response?.data || err.message
        );
      }
    };
    fetch();
  }, []);

  const handleCancel = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirm) return;

    try {
      const res = await axios.delete(
        `http://localhost:5001/api/bookings/cancel/${id}`
      );
      console.log("✅ Booking cancelled and deleted:", res.data.message);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(
        "❌ Error cancelling booking:",
        err.response?.data || err.message
      );
      alert("Failed to cancel booking. Check console for details.");
    }
  };

  const renderSection = (title, status) => {
    const filtered = bookings.filter((b) => b.status === status);
    if (filtered.length === 0) return null;

    return (
      <div className={`booking-section ${status}`}>
        <h3>{title}</h3>
        <div className="booking-grid">
          {filtered.map((b) => (
            <div className={`booking-card ${status}`} key={b._id}>
              <img
                src={`http://localhost:5001/${b.vehicleId?.thumbnail}`}
                alt="vehicle"
              />
              <div className="booking-info">
                <h3>
                  {b.vehicleId?.name} ({b.vehicleId?.brand})
                </h3>
                <p>
                  <strong>Dates:</strong>{" "}
                  {new Date(b.startDate).toLocaleDateString()} –{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Location:</strong> {b.vehicleId?.location}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${b.status}`}>{b.status}</span>
                </p>
                {b.status === "pending" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(b._id)}
                  >
                    Cancel Booking
                  </button>
                )}
                {b.status === "approved" && (
                  <button
                    className="pay-btn"
                    onClick={() => (window.location.href = `/payment/${b._id}`)}
                  >
                    Confirm & Pay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="no-vehicles-section">
          <p className="no-vehicles">You haven't booked any vehicles yet.</p>
          <img
            src="/owner-images/empty-car.png"
            alt="no cars"
            className="empty-img"
          />
        </div>
      ) : (
        <>
          {renderSection("Approved Bookings", "approved")}
          {renderSection("Pending Bookings", "pending")}
          {renderSection("Rejected Bookings", "rejected")}
        </>
      )}
    </div>
  );
}
