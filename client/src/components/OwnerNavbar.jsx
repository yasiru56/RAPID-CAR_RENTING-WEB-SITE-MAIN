import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/owner/home" className="navbar__logo">
          <img
            src="/logo.png"
            alt="Rapid Rent Logo"
            className="navbar__image"
          />
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className="navbar__toggle" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </div>

        {/* Nav Links for Owner */}
        <ul className={`navbar__links ${isOpen ? "navbar__active" : ""}`}>
          <li>
            <Link to="/owner/home" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/owner/dashboard" onClick={() => setIsOpen(false)}>
              My Vehicles
            </Link>
          </li>
          <li>
            <Link to="/owner/add-vehicle" onClick={() => setIsOpen(false)}>
              Add Vehicle
            </Link>
          </li>
          <li>
            <Link to="/owner/my-bookings" onClick={() => setIsOpen(false)}>
              Booking Requests
            </Link>
          </li>
          <li>
            <Link to="/owner/profile" onClick={() => setIsOpen(false)}>
              Owner Profile
            </Link>
          </li>
          <li>
            <Link to="/logout" onClick={() => setIsOpen(false)}>
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
