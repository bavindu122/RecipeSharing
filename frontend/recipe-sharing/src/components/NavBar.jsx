import React from "react";
import { assets } from "../assets/assets";
import {
  FaHome,
  FaBook,
  FaHeart,
  FaInfoCircle,
  FaSignInAlt,
} from "react-icons/fa";

export const NavBar = ({ openModal }) => {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <a href="#" className="brand" aria-label="Yumy2You Home">
          <img
            src={assets.logox}
            alt="Yumy2You Logo"
            className="logo"
            width={120}
            height={28}
          />
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a href="#" className="nav-link">
            <FaHome /> <span>Home</span>
          </a>
          <a href="#" className="nav-link">
            <FaBook /> <span>My Recipes</span>
          </a>
          <a href="#" className="nav-link">
            <FaHeart /> <span>Favourites</span>
          </a>
          <a href="#" className="nav-link">
            <FaInfoCircle /> <span>About</span>
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className="btn btn-secondary btn-login"
            onClick={() => openModal && openModal()}
          >
            <FaSignInAlt /> <span>Login</span>
          </button>
        </div>
      </div>
    </header>
  );
};
