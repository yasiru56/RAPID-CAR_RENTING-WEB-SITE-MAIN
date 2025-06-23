/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BookingRequests.css";
import { Link } from "react-router-dom";

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/bookings");
      setBookings(res.data.filter((b) => b.status !== "cancelled"));
    } catch (err) {
      console.error("Failed to fetch bookings:", err.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/bookings/${id}`, {
        status: newStatus,
      });
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (!statusFilter) return true;
    return b.status === statusFilter;
  });

  const today = new Date().setHours(0, 0, 0, 0);

  const recentPending = bookings.filter(
    (b) => b.status === "pending" && new Date(b.createdAt).getTime() >= today
  );
  const oldPending = bookings.filter(
    (b) => b.status === "pending" && new Date(b.createdAt).getTime() < today
  );

  const approved = filteredBookings.filter((b) => b.status === "approved");
  const rejected = filteredBookings.filter((b) => b.status === "rejected");

  const renderSection = (title, list, statusClass = "", icon = "") => {
    if (list.length === 0) return null;
    return (
      <div className={`booking-section ${statusClass}`}>
        <div className="section-header">
          <i className={`bi ${icon}`}></i>
          <h3>{title}</h3>
          <span className="badge bg-secondary ms-2">{list.length}</span>
        </div>
        <div className="booking-card-grid">
          {list.map((b) => (
            <div className={`booking-card ${b.status}`} key={b._id}>
              <div className="card-header">
                <span className={`status ${b.status}`}>
                  <i className={`bi bi-${b.status === 'approved' ? 'check-circle' : b.status === 'rejected' ? 'x-circle' : 'hourglass-split'} me-1`}></i>
                  {b.status}
                </span>
                <span className="booking-date">
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {b.vehicleId?.thumbnail && (
                <div className="image-container">
                  <img
                    src={`http://localhost:5001/${b.vehicleId.thumbnail}`}
                    alt="Vehicle"
                    className="vehicle-thumb"
                  />
                </div>
              )}
              
              <div className="booking-info">
                <div className="info-row">
                  <i className="bi bi-person-circle"></i>
                  <div>
                    <label>Renter</label>
                    <p>{b.renterName}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <i className="bi bi-car-front"></i>
                  <div>
                    <label>Vehicle</label>
                    <p>{b.vehicleId?.name} ({b.vehicleId?.brand})</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <i className="bi bi-geo-alt"></i>
                  <div>
                    <label>Location</label>
                    <p>{b.vehicleId?.location}</p>
                  </div>
                </div>
              </div>
              
              <button className="view-details-btn" onClick={() => setSelectedBooking(b)}>
                <i className="bi bi-eye me-2"></i>
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="booking-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <i className="bi bi-calendar-check text-success me-2"></i>
            <div>
              <h2>Booking Requests</h2>
              <p className="subtitle">
                <i className="bi bi-car-front me-1"></i>
                Total Bookings: {bookings.length}
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card pending">
              <i className="bi bi-hourglass-split"></i>
              <div>
                <h4>{recentPending.length + oldPending.length}</h4>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card approved">
              <i className="bi bi-check-circle"></i>
              <div>
                <h4>{approved.length}</h4>
                <p>Approved</p>
              </div>
            </div>
            <div className="stat-card rejected">
              <i className="bi bi-x-circle"></i>
              <div>
                <h4>{rejected.length}</h4>
                <p>Rejected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-toggle">
          <label>
            <i className="bi bi-funnel me-2"></i>
            Filter by:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Bookings</option>
            <option value="pending">Pending Requests</option>
            <option value="approved">Approved Bookings</option>
            <option value="rejected">Rejected Requests</option>
          </select>
        </div>
      </div>
      <div className="booking-content">
        {bookings.length === 0 ? (
          <div className="no-bookings-section">
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <h3>No Bookings Yet</h3>
            <p className="text-muted">You haven't received any booking requests yet.</p>
            <img
              src="/owner-images/empty-car.png"
              alt="no cars"
              className="empty-img mt-4"
            />
          </div>
        ) : (
          <div className="booking-sections">
            {renderSection(
              "Recent Pending Bookings", 
              recentPending, 
              "recent",
              "bi-clock-history text-warning"
            )}
            {renderSection(
              "Older Pending Bookings", 
              oldPending, 
              "old",
              "bi-exclamation-circle text-danger"
            )}
            {renderSection(
              "Approved Bookings", 
              approved, 
              "approved",
              "bi-check-circle-fill text-success"
            )}
            {renderSection(
              "Rejected Bookings", 
              rejected, 
              "rejected",
              "bi-x-circle-fill text-danger"
            )}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="bi bi-info-circle me-2"></i>
                Booking Details
              </h3>
              <button
                className="modal-close"
                onClick={() => setSelectedBooking(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="booking-status-banner">
                <span className={`status ${selectedBooking.status}`}>
                  <i className={`bi bi-${selectedBooking.status === 'approved' ? 'check-circle' : selectedBooking.status === 'rejected' ? 'x-circle' : 'hourglass-split'} me-2`}></i>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </span>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <i className="bi bi-person-circle text-primary"></i>
                  <div>
                    <label>Renter</label>
                    <p>{selectedBooking.renterName}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <i className="bi bi-telephone text-success"></i>
                  <div>
                    <label>Contact</label>
                    <p>{selectedBooking.contact}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <i className="bi bi-envelope text-info"></i>
                  <div>
                    <label>Email</label>
                    <p>{selectedBooking.email}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <i className="bi bi-car-front text-warning"></i>
                  <div>
                    <label>Vehicle</label>
                    <p>{selectedBooking.vehicleId?.name} ({selectedBooking.vehicleId?.brand})</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <i className="bi bi-geo-alt text-danger"></i>
                  <div>
                    <label>Pickup Location</label>
                    <p>{selectedBooking.pickupLocation}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <i className="bi bi-calendar-range text-primary"></i>
                  <div>
                    <label>Rental Period</label>
                    <p>
                      {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="info-item notes">
                  <i className="bi bi-chat-left-text text-secondary"></i>
                  <div>
                    <label>Additional Notes</label>
                    <p>{selectedBooking.notes || "No additional notes provided."}</p>
                  </div>
                </div>
              </div>
              
              {selectedBooking.status === "pending" && (
                <div className="modal-actions">
                  <button
                    className="btn-approve"
                    onClick={() => updateStatus(selectedBooking._id, "approved")}
                  >
                    <i className="bi bi-check-lg me-2"></i>
                    Approve Request
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => updateStatus(selectedBooking._id, "rejected")}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
