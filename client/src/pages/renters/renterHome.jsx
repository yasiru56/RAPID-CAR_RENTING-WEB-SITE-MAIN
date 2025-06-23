import React from "react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import "./renterHome.css"; // custom CSS file for styling

export default function RenterHome() {
  const navigate = useNavigate();

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");

  return (
    <div className="renter-home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Drive Your Dream Car</h1>
          <p>Find affordable, high-quality rentals near you in seconds.</p>

          <div className="trust-badges">
            <div>✅ 1000+ cars across Sri Lanka</div>
            <div>⭐ 4.9/5 User Rating</div>
            <div>🔒 Safe & Secure Payments</div>
          </div>

          <div className="search-bar">
            <select
              className="location-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Select Location</option>
              <option value="Colombo">Colombo</option>
              <option value="Kandy">Kandy</option>
              <option value="Negombo">Negombo</option>
              <option value="Galle">Galle</option>
              <option value="Kurunegala">Kurunegala</option>
              <option value="Matara">Matara</option>
              <option value="Anuradhapura">Anuradhapura</option>
              {/* Add more as needed */}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Select Vehicle Type</option>

              <option value="Car">Car</option>
              <option value="Van">Van</option>
              {/* Add more as needed */}
            </select>

            <button
              onClick={() =>
                navigate(
                  `/catalog?location=${selectedLocation}&type=${selectedType}`
                )
              }
            >
              Search
            </button>
          </div>

          <button className="hero-btn" onClick={() => navigate("/catalog")}>
            Browse Cars
          </button>

          <p className="quote">
            “The most convenient way to rent a car in Sri Lanka”
          </p>
        </div>

        <img
          src="/renter-images/hero-car.png"
          alt="Hero Car"
          className="hero-image"
        />
      </section>

      <section className="why-choose-us">
        <h2>Why Rent with Rapid Rent?</h2>
        <div className="features">
          <div className="feature-box">
            <img src="/renter-images/insurance.png" alt="Insurance" />
            <h4>Full Insurance</h4>
            <p>Your trip is covered with complete protection plans.</p>
          </div>
          <div className="feature-box">
            <img src="/renter-images/support.png" alt="Support" />
            <h4>24/7 Support</h4>
            <p>Assistance whenever you need it, day or night.</p>
          </div>
          <div className="feature-box">
            <img src="/renter-images/deals.png" alt="Deals" />
            <h4>Best Price Guarantee</h4>
            <p>Top deals and flexible pricing with no hidden fees.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="info-section">
        <h2>How It Works</h2>
        <div className="info-grid">
          <div className="info-card">
            <img src="/renter-images/step1.png" alt="Step 1" />
            <h3>1. Search</h3>
            <p>Enter your location and dates to see available vehicles.</p>
          </div>
          <div className="info-card">
            <img src="/renter-images/step2.png" alt="Step 2" />
            <h3>2. Choose</h3>
            <p>
              Pick from a wide variety of cars that fit your needs and budget.
            </p>
          </div>
          <div className="info-card">
            <img src="/renter-images/step3.png" alt="Step 3" />
            <h3>3. Drive</h3>
            <p>Book instantly and hit the road with ease and flexibility.</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Renters Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial">
            <p>
              "Super fast and easy! I got my car in 10 minutes and it was
              spotless. Highly recommended!"
            </p>
            <span>- Nimal Perera, Colombo</span>
          </div>
          <div className="testimonial">
            <p>
              "Affordable pricing and very professional support. Booking was
              smooth!"
            </p>
            <span>- Kaushi Fernando, Kandy</span>
          </div>
          <div className="testimonial">
            <p>
              "Great selection of vehicles. I rented a hybrid for my trip to
              Ella. Perfect experience."
            </p>
            <span>- Dinesh Silva, Negombo</span>
          </div>
          <div className="testimonial">
            <p>
              "Friendly customer service and no hidden charges. Will definitely
              rent again."
            </p>
            <span>- Harsha Rajapaksha, Galle</span>
          </div>
          <div className="testimonial">
            <p>
              "Loved how easy it was to compare prices and book instantly. A++"
            </p>
            <span>- Nadeesha Jayasuriya, Matara</span>
          </div>
          <div className="testimonial">
            <p>
              "Their support team helped me even at midnight! Truly a life
              saver."
            </p>
            <span>- Thilina Weerasinghe, Anuradhapura</span>
          </div>
        </div>
      </section>

      <section className="top-cities">
        <h2>Available in Top Cities</h2>
        <div className="city-list">
          <div className="city-card">
            <img src="/renter-images/colombo.png" alt="Colombo" />
            <h4>Colombo</h4>
          </div>
          <div className="city-card">
            <img src="/renter-images/kandy.png" alt="Kandy" />
            <h4>Kandy</h4>
          </div>
          <div className="city-card">
            <img src="/renter-images/galle.png" alt="Galle" />
            <h4>Galle</h4>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Ready to ride?</h2>
        <button className="cta-btn" onClick={() => navigate("/catalog")}>
          Start Browsing
        </button>
      </section>
    </div>
  );
}
