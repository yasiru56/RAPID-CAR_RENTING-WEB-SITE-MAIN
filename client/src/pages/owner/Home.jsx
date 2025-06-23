import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const handleSendReport = () => {
  // Handle the report sending logic here
  const phoneNumber = "+94767005231"; // Replace with the actual phone number
  const message = "Hello, I would like to report an issue with my vehicle listing."; // Replace with the actual message
  const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section with WhatsApp Button */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Manage Your <span className="text-gradient">Vehicles</span> Effortlessly
          </h1>
          <p>
            <i className="bi bi-check2-circle me-2 text-success"></i>
            Easily add, update, and track your vehicles with
            <span className="fw-bold text-success"> Rapid Rent</span>
          </p>
          <div className="d-flex gap-3 mt-4">
            <Link className="btn btn-success d-flex align-items-center" to="/owner/add-vehicle">
              <i className="bi bi-plus-circle me-2"></i>
              Add Your Vehicles
            </Link>
            <button onClick={handleSendReport} className="whatsapp-button">
              <i className="bi bi-whatsapp"></i>
              Chat with Us
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h1 className="mb-5">
          <i className="bi bi-stars me-2 text-warning"></i>
          Why List Your Vehicles with Us?
        </h1>
        <div className="benefit-cards">
          <article className="benefit-card">
            <i className="bi bi-lightning-charge-fill"></i>
            <h3>Quick Setup</h3>
            <p>
              <i className="bi bi-check2 me-2 text-success"></i>
              List vehicles in minutes
            </p>
            <p>
              <i className="bi bi-check2 me-2 text-success"></i>
              Start earning immediately
            </p>
          </article>

          <article className="benefit-card">
            <i className="bi bi-graph-up-arrow"></i>
            <h3>Maximize Earnings</h3>
            <p>
              <i className="bi bi-check2 me-2 text-success"></i>
              Competitive market rates
            </p>
            <p>
              <i className="bi bi-check2 me-2 text-success"></i>
              Smart pricing suggestions
            </p>
          </article>

          <article className="benefit-card">
            <i className="bi bi-shield-check"></i>
            <h3>Secure Management</h3>
            <p>
              <i className="bi bi-check2 me-2 text-success"></i>
              Real-time tracking
            </p>
            <p>
              <i className="bi bi-check2 me-2 text-success"></i>
              24/7 support available
            </p>
          </article>
        </div>
      </section>

      {/* Next Level Section with WhatsApp icon */}
      <section className="next-level-section">
        <i className="bi bi-rocket-takeoff display-1 text-success mb-4"></i>
        <h2>Take Your Business to the Next Level</h2>
        
      </section>
    </div>
  );
}

export default Home;