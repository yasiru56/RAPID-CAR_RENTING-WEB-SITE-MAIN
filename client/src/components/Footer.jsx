import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa"; // Social Icons

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Left Side - Logo & About */}
        <div className="footer__about">
          <h2>Rapid Rent</h2>
          <p>
            Rent your favorite vehicles easily and affordably. Experience
            hassle-free car rentals with us.
          </p>
        </div>

        {/* Right Side - Social Media */}
        <div className="footer__social">
          <h3>Follow Us</h3>
          <div className="footer__icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer__bottom">
        <p>
          &copy; {new Date().getFullYear()} Rapid Rent. All rights reserved.
        </p>
        <p>
          <Link to="/terms">Terms of Service</Link> |{" "}
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
