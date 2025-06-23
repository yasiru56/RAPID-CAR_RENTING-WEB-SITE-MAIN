import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function RenterNavbar() {
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <img src="/logo.png" alt="Rapid Rent" className="navbar__image" />
        </Link>
        <ul className="navbar__links">
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/catalog">Browse Vehicles</Link>
          </li>
          <li>
            <Link to="/my-bookings">My Bookings</Link>
          </li>
          <li>
            <Link to="/wishlist">Wishlist</Link>
          </li>
          <li>
            <Link to="/user/userprofile">Profile</Link>
          </li>
          <li>
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
export default RenterNavbar;
