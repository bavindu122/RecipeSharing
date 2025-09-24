import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaClock, FaHeart, FaUtensils, FaEye, FaUser } from "react-icons/fa";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export const RecipeItems = () => {
  const data = useLoaderData();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth() || {};
  // make a local copy so we can update like counts optimistically
  const [recipes, setRecipes] = useState(() =>
    Array.isArray(data) ? data : []
  );

  // keep local state in sync with loader data (e.g., when searching)
  useEffect(() => {
    setRecipes(Array.isArray(data) ? data : []);
  }, [data]);

  const handleToggleLike = async (recipeId, index) => {
    if (!isAuthenticated) {
      // redirect to login modal/route; for now, navigate to profile/login
      return navigate("/profile");
    }
    try {
      // optimistic UI update
      setRecipes((prev) => {
        const next = [...prev];
        const r = { ...next[index] };
        const likedBy = Array.isArray(r.likedBy) ? [...r.likedBy] : [];
        const likeCount =
          typeof r.likeCount === "number" ? r.likeCount : likedBy.length;
        const i = likedBy.findIndex((u) => String(u) === String(userId));
        if (i >= 0) {
          likedBy.splice(i, 1);
          r.likeCount = likeCount - 1;
        } else {
          likedBy.push(String(userId));
          r.likeCount = likeCount + 1;
        }
        r.likedBy = likedBy;
        next[index] = r;
        return next;
      });
      const res = await api.post(`/recipe/${recipeId}/like`);
      // reconcile with server count if needed
      const { likeCount } = res.data || {};
      if (typeof likeCount === "number") {
        setRecipes((prev) => {
          const next = [...prev];
          if (next[index]?._id === recipeId)
            next[index] = { ...next[index], likeCount };
          return next;
        });
      }
    } catch (e) {
      // rollback on error: refetching would be cleaner; for now, no-op or reload
      // console.error(e);
    }
  };
  return (
    <>
      <div className="card-container" id ="recipe-items">
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
            const authorName =
              item?.author?.userName || item?.authorName || null;
            const descSource = item?.description || item?.instructions || "";
            const desc = (() => {
              const clean = String(descSource).replace(/\s+/g, " ").trim();
              const limit = 120;
              return clean.length > limit
                ? `${clean.slice(0, limit)}...`
                : clean;
            })();
            const prep = item?.time?.prep ?? "--";
            const cook = item?.time?.cook ?? "--";
            const total = item?.time?.total ?? "--";
            const servings = item?.servings ?? null;

            const likedBy = Array.isArray(item?.likedBy) ? item.likedBy : [];
            const likeCount =
              typeof item?.likeCount === "number"
                ? item.likeCount
                : likedBy.length;
            const isLikedByMe = userId
              ? likedBy.map(String).includes(String(userId))
              : false;

            return (
              <div className="card" key={index}>
                <div className="card-image-wrapper">
                  <img src={imgSrc} alt={title} className="card-image" />
                  <button
                    className="icon-btn fav-btn"
                    aria-label={isLikedByMe ? "Unlike" : "Like"}
                    onClick={() => handleToggleLike(item?._id, index)}
                    title={isLikedByMe ? "Unlike" : "Like"}
                  >
                    <FaHeart
                      style={{ color: isLikedByMe ? "#e11d48" : undefined }}
                    />
                  </button>
                </div>

                <div className="card-body">
                  <div className="title">{title}</div>
                  {desc && (
                    <p className="text-sm text-neutral-300/90">{desc}</p>
                  )}

                  <div className="card-meta w-full items-center justify-between">
                    <span className="meta" title="Cook time">
                      <FaClock /> {cook}
                    </span>
                    <span className="meta" title="Author and likes">
                      <span className="inline-flex items-center gap-1 mr-3">
                        <FaHeart className="opacity-80" /> {likeCount}
                      </span>
                      {authorName ? (
                        <>
                          <FaUser /> {authorName}
                        </>
                      ) : (
                        <span className="opacity-60">&nbsp;</span>
                      )}
                    </span>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/recipe/${item?._id}`)}
                    >
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
