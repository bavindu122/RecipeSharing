import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FaEye, FaClock, FaPlus, FaHeart } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";

const resolveImg = (item) => {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  if (item?.coverImage) {
    return item.coverImage.startsWith("http")
      ? item.coverImage
      : `${apiBase}${item.coverImage}`;
  }
  return null;
};

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/recipe/mine");
        if (mounted) setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load recipes";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="min-h-[calc(100vh-64px)] py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-6xl">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              My Recipes
            </h1>
            <p className="text-neutral-300/80 mt-1">
              Your uploaded recipes are listed below. Only you can see this
              page.
            </p>
          </div>
          <button
            onClick={() => navigate("/addNewRecipe")}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 font-semibold text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:from-blue-500 hover:to-blue-400"
          >
            <FaPlus /> Add New
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-neutral-300/80">
            You haven't added any recipes yet.
          </div>
        ) : (
          <div
            className="card-container"
            style={{ maxWidth: "100%", padding: 0 }}
          >
            {recipes.map((item) => {
              const imgSrc = resolveImg(item);
              const title = item?.title || "Untitled Recipe";
              const cook = item?.time?.cook ?? "--";
              const likeCount =
                typeof item?.likeCount === "number"
                  ? item.likeCount
                  : Array.isArray(item?.likedBy)
                  ? item.likedBy.length
                  : 0;
              return (
                <div className="card" key={item._id}>
                  <div className="card-image-wrapper">
                    {imgSrc ? (
                      <img src={imgSrc} alt={title} className="card-image" />
                    ) : (
                      <div className="w-full h-[200px] grid place-items-center text-neutral-400 bg-black/30">
                        No image
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        className="icon-btn"
                        aria-label="More actions"
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === item._id ? null : item._id
                          )
                        }
                      >
                        <HiOutlineDotsVertical />
                      </button>
                      {openMenuId === item._id && (
                        <div className="mt-2 w-36 rounded-md border border-white/10 bg-[#0f0f10] shadow-lg overflow-hidden">
                          <button
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                            onClick={() => navigate(`/recipe/${item._id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-white/10"
                            onClick={async () => {
                              const ok = window.confirm(
                                "Delete this recipe? This cannot be undone."
                              );
                              if (!ok) return;
                              try {
                                await api.delete(`/recipe/${item._id}`);
                                setRecipes((prev) =>
                                  prev.filter((r) => r._id !== item._id)
                                );
                              } catch (e) {
                                // optional: show error toast
                              } finally {
                                setOpenMenuId(null);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="title">{title}</div>
                    <div className="card-meta w-full items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="meta">
                          <FaClock /> {cook}
                        </span>
                        <span className="meta" title="Total likes">
                          <FaHeart /> {likeCount}
                        </span>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/recipe/${item._id}`)}
                      >
                        <FaEye /> View
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

export default MyRecipes;
