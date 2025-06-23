import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById } from "../../Services/vehicleService";
import "./BookingForm.css";

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState({
    renterName: "",
    contact: "",
    email: "",
    pickupLocation: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    getVehicleById(id).then((res) => setVehicle(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { renterName, contact, email, pickupLocation, startDate, endDate } =
      form;

    if (
      !renterName ||
      !contact ||
      !email ||
      !pickupLocation ||
      !startDate ||
      !endDate
    ) {
      alert("Please fill in all required fields.");
      return false;
    }

    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(renterName)) {
      alert("Name must contain only letters.");
      return false;
    }

    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contact)) {
      alert("Contact number must be exactly 10 digits.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!nameRegex.test(pickupLocation)) {
      alert("Pickup location must contain only letters.");
      return false;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minEndDate = tomorrow.setHours(0, 0, 0, 0);

    if (start <= today) {
      alert("Start date must be after today.");
      return false;
    }

    if (end <= minEndDate) {
      alert("End date must be at least two days from today.");
      return false;
    }

    if (end <= start) {
      alert("End date must be after the start date.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...form,
      vehicleId: id,
    };

    try {
      await fetch("http://localhost:5001/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Booking request sent successfully!");
      navigate("/my-bookings");
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    }
  };

  if (!vehicle) return <div>Loading...</div>;

  return (
    <div className="booking-form-container">
      <h2>Book: {vehicle.name}</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <input
          type="text"
          name="renterName"
          placeholder="Your Name"
          value={form.renterName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="pickupLocation"
          placeholder="Pickup Location"
          value={form.pickupLocation}
          onChange={handleChange}
          required
        />
        <label>Start Date</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />
        <label>End Date</label>
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
        />
        <textarea
          name="notes"
          placeholder="Additional Notes (optional)"
          value={form.notes}
          onChange={handleChange}
        />

        <button type="submit">Send Booking Request</button>
      </form>
    </div>
  );
}
