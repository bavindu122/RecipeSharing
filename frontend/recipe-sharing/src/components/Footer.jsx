import React from "react";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import { assets } from "../assets/assets";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <img
            src={assets.logoy}
            alt="Yumy2You Logo"
            className="logo"
          
          />
        </div>
        <p className="footer-tagline">Cook. Share. Enjoy.</p>

        <div className="footer-links">
          <a href="#">Home</a>
          <a href="#">My Recipes</a>
          <a href="#">Favourites</a>
          <a href="#">About</a>
        </div>
        <div className="footer-social">
          <a href="#" aria-label="GitHub" className="social-link">
            <FaGithub />
          </a>
          <a href="#" aria-label="Twitter" className="social-link">
            <FaTwitter />
          </a>
          <a href="#" aria-label="Instagram" className="social-link">
            <FaInstagram />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} Yumy2You. All rights reserved.</p>
      </div>
    </footer>
  );
};
