import React from "react";
import { useLoaderData } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaClock, FaHeart, FaUtensils, FaEye } from "react-icons/fa";

export const RecipeItems = () => {
  const recipes = useLoaderData();
  console.log(recipes);
  return (
    <>
      <div className="card-container">
        {Array.isArray(recipes) && recipes.length > 0 ? (
          recipes.map((item, index) => {
            // Build image source: prefer backend-provided coverImage
            let imgSrc = assets.foodImage;
            const apiBase =
              import.meta.env.VITE_API_BASE || "http://localhost:5000";
            if (item?.coverImage) {
              imgSrc = item.coverImage.startsWith("http")
                ? item.coverImage
                : `${apiBase}${item.coverImage}`;
            } else if (item?.image || item?.imageUrl) {
              imgSrc = item.image || item.imageUrl;
            }
            const title = item?.title || "Untitled Recipe";
            const prep = item?.time?.prep ?? "--";
            const cook = item?.time?.cook ?? "--";
            const total = item?.time?.total ?? "--";
            const servings = item?.servings ?? null;

            return (
              <div className="card" key={index}>
                <div className="card-image-wrapper">
                  <img src={imgSrc} alt={title} className="card-image" />
                  <button
                    className="icon-btn fav-btn"
                    aria-label="Add to favourites"
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="card-body">
                  <div className="title">{title}</div>
                  <div className="card-meta">
                    <span className="meta" title="Cook time">
                      <FaClock /> {cook}
                    </span>
                    {servings && (
                      <span className="meta" title="Servings">
                        <FaUtensils /> {servings}
                      </span>
                    )}
                  </div>

                  <div className="card-actions">
                    <button className="btn btn-secondary btn-sm">
                      <FaEye /> <span>View Recipe</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#b0b0b0", textAlign: "center", width: "100%" }}>
            No recipes available.
          </p>
        )}
      </div>
    </>
  );
};
