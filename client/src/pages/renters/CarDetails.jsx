import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ import navigate
import { getVehicleById } from "../../Services/vehicleService";
import "./CarDetails.css";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ initialize navigate
  const [car, setCar] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await getVehicleById(id);
        setCar(res.data);
      } catch (err) {
        console.error("Error loading car:", err.message);
      }
    };

    fetchCar();
  }, [id]);

  if (!car) return <div>Loading...</div>;

  return (
    <div className="car-details-container">
      <div className="car-header">
        <h1>
          {car.name} ({car.brand})
        </h1>
        <p className="price">LKR {car.price}/day</p>
      </div>

      <div className="car-gallery">
        {car.images.map((img, index) => (
          <img
            key={img} // Use the image URL or a unique identifier as the key
            src={`http://localhost:5001/${img}`}
            alt={`car ${index}`}
            onClick={() => setPreviewImg(`http://localhost:5001/${img}`)}
            onKeyDown={(e) => e.key === "Enter" && setPreviewImg(`http://localhost:5001/${img}`)} // Add keyboard accessibility
            role="button" // Make it a button-like element for accessibility
            tabIndex={0} // Make it focusable
            className="car-thumbnail"
          />
        ))}
      </div>

      <ul className="car-info">
        <li>
          <strong>Type:</strong> {car.type}
        </li>
        <li>
          <strong>Brand:</strong>{car.brand}
        </li>
        
        <li>
          <strong>Location:</strong> {car.location}
        </li>
      </ul>

      <div className="car-description">
        <h3>Vehicle Description</h3>
        <p>{car.description || "No description provided by the owner."}</p>
      </div>

      <div className="action-buttons">
        <button
          className="book-now-btn"
          onClick={() => navigate(`/book/${car._id}`)}
        >
          Book Now
        </button>
        
        <button
          className="chat-now-btn"
          onClick={() => navigate(`/chat/${car._id}/new`)}
        >
          <i className="bi bi-chat-dots"></i> Chat with Owner
        </button>
      </div>

      {/* Modal for image preview */}
      {previewImg && (
        <div className="image-modal" onClick={() => setPreviewImg(null)}>
          <span className="close">&times;</span>
          <img src={previewImg} alt="Preview" className="modal-content" />
        </div>
      )}
    </div>
  );
}
