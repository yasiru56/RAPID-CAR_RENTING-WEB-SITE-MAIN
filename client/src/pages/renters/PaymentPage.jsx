import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentPage.css";

export default function BookingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/bookings/${id}`);
        setBooking(res.data);
        setVehicle(res.data.vehicleId);
      } catch (err) {
        console.error("Error fetching booking:", err);
        alert("Failed to load booking data.");
      }
    };
    fetchBooking();
  }, [id]);

  const handleConfirm = async () => {
    try {
      await axios.patch(`http://localhost:5001/api/bookings/${id}`, {
        status: "approved",
      });

      // Send email to owner (assumes backend triggers it on confirmation)
      await axios.post(
        "http://localhost:5001/api/notifications/owner-confirmation",
        {
          bookingId: id,
        }
      );

      alert("Booking confirmed! The owner has been notified.");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Error confirming booking:", err);
      alert("Failed to confirm booking.");
    }
  };

  if (!booking || !vehicle)
    return <div className="payment-container">Loading...</div>;

  const getDaysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const rentalDays = getDaysBetween(booking.startDate, booking.endDate);
  const dailyPrice = vehicle.price || 0;
  const total = rentalDays * dailyPrice;

  return (
    <div className="payment-container">
      <h2>Confirm & Pay</h2>
      <div className="payment-card">
        <h3>
          {vehicle.name} ({vehicle.brand})
        </h3>
        <p>
          <strong>Location:</strong> {vehicle.location}
        </p>
        <p>
          <strong>Renter:</strong> {booking.renterName}
        </p>
        <p>
          <strong>Dates:</strong>{" "}
          {new Date(booking.startDate).toLocaleDateString()} -{" "}
          {new Date(booking.endDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Pickup:</strong> {booking.pickupLocation}
        </p>

        <div className="payment-info">
          <p>
            <strong>Total:</strong> LKR {total}
          </p>
          <p style={{ fontStyle: "italic" }}>Payment system need to add here</p>
        </div>

        <button className="confirm-button" onClick={handleConfirm}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
