import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaHeart } from "react-icons/fa";

const Favorites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/recipe/favorites/mine");
        if (mounted) setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        // console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="container py-6">Loading favorites…</div>;

  return (
    <section className="min-h-[calc(100vh-64px)] py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            My Favorite Recipes
           
          </h1>
        </div>
        {items.length === 0 ? (
          <p className="opacity-70">No favorites yet.</p>
        ) : (
          <div className="card-container">
            {items.map((item) => {
              const apiBase =
                import.meta.env.VITE_API_BASE || "http://localhost:5000";
              const imgSrc = item?.coverImage?.startsWith("http")
                ? item.coverImage
                : `${apiBase}${item?.coverImage ?? ""}`;
              return (
                <div className="card" key={item?._id}>
                  <div className="card-image-wrapper">
                    <img
                      src={imgSrc}
                      alt={item?.title}
                      className="card-image"
                    />
                  </div>
                  <div className="card-body">
                    <div className="title">{item?.title}</div>
                    {item?.likeCount !== undefined && (
                      <div className="text-sm opacity-75 inline-flex items-center gap-1">
                        <FaHeart /> {item.likeCount}
                      </div>
                    )}
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
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;
