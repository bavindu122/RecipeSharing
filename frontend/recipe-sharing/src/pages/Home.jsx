import React from "react";
import {
  FaFireAlt,
  FaBolt,
  FaStar,
  FaHeart,
  FaUtensils,
  FaPlay,
} from "react-icons/fa";
import { assets } from "../assets/assets";
import { RecipeItems } from "../components/RecipeItems";

export const Home = () => {
  return (
    <>
      <section className="home">
        <div className="hero-content">
          <div className="left">
        
            <h1 className="hero-title">
              Discover Amazing
              <span className="highlight"> Food Recipes</span>
            </h1>
            <p className="hero-description">
              Unlock culinary excellence with our curated collection of recipes.
              From quick weekday meals to gourmet weekend feasts, find your next
              favorite dish and elevate your cooking journey.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Recipes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50k+</span>
                <span className="stat-label">Happy Cooks</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="btn btn-primary">
                <span>Get Started</span>
              </button>
              <button className="btn btn-secondary">
                <FaPlay />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
          <div className="right">
            <div className="hero-image-container">
              <div className="floating-elements">
                <div className="floating-card card-1">
                  <FaFireAlt /> <span>Trending</span>
                </div>
                <div className="floating-card card-2">
                  <FaStar /> <span>4.9/5</span>
                </div>
                <div className="floating-card card-3">
                  <FaUtensils /> <span>Chef's Special</span>
                </div>
              </div>
              <div className="image-backdrop"></div>
              <img
                src={assets.foodImage}
                alt="Delicious Food Recipe"
                className="hero-image"
                width={400}
                height={400}
              />
              <div className="image-glow"></div>
            </div>
          </div>
        </div>
        <div className="hero-features">
          <div className="feature-item">
            <div className="feature-icon">
              <FaFireAlt />
            </div>
            <span>Trending Recipes</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FaBolt />
            </div>
            <span>Quick & Easy</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FaStar />
            </div>
            <span>Chef Approved</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FaHeart />
            </div>
            <span>Family Favorites</span>
          </div>
        </div>
      </section>
      {/* Decorative divider replacing the wave */}
      <div className="section-divider">
        <div className="divider-line" />
        <div className="divider-icon">
          <FaUtensils />
        </div>
        <div className="divider-line" />
      </div>
      <RecipeItems />
    </>
  );
};
