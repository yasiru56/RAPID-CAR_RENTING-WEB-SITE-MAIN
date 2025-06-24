// AdminNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";  // Assuming correct CSS file name

function AdminNavbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/admin" className="navbar-logo">
          <img src="/logo.png" alt="Rapid Rent" className="navbar-image" />
        </Link>
        
        <ul className="navbar-links">
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/users">Users</Link>
          </li>
          <li>
            <Link to="/admin/vehicles">Vehicles</Link>
          </li>
          {/* Add Approvals Link */}
          <li>
            <Link to="/admin/approvals">Approvals</Link>
          </li>
          <li>
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default AdminNavbar;
