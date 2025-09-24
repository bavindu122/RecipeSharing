import React from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

const resolveImage = (recipe) => {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  if (recipe?.coverImage) {
    return recipe.coverImage.startsWith("http")
      ? recipe.coverImage
      : `${apiBase}${recipe.coverImage}`;
  }
  return null;
};

export const RecipeDetails = () => {
  const recipe = useLoaderData();
  const navigate = useNavigate();
  if (!recipe) return null;

  const imgSrc = resolveImage(recipe);
  const title = recipe.title || "Untitled Recipe";
  const authorName = recipe?.author?.userName || null;
  const { prep, cook, total } = recipe?.time || {};

  return (
    <section className="min-h-[calc(100vh-64px)] py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/30">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-neutral-400">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              {title}
            </h1>
            {authorName && (
              <div className="mt-1 text-neutral-300/80">
                by{" "}
                <span className="font-semibold text-white">{authorName}</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-200/90">
              {prep && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Prep: {prep}
                </span>
              )}
              {cook && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Cook: {cook}
                </span>
              )}
              {total && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Total: {total}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">Ingredients</h2>
              <ul className="list-disc pl-5 space-y-1 text-neutral-100">
                {Array.isArray(recipe.ingredients) &&
                recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{ing.name}</span>
                      {ing.quantity ? (
                        <span className="text-neutral-300">
                          {" "}
                          — {ing.quantity}
                        </span>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li>No ingredients listed.</li>
                )}
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">Instructions</h2>
              <div className="whitespace-pre-wrap text-neutral-100/90">
                {recipe.instructions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeDetails;
