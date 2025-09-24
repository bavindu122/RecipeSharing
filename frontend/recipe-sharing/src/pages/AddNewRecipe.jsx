import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export const AddNewRecipe = () => {
  const navigate = useNavigate();

  // Form state aligned with backend model
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [instructions, setInstructions] = useState("");
  const [time, setTime] = useState({ prep: "", cook: "", total: "" });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [categories, setCategories] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [tags, setTags] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canPreview = useMemo(
    () => Boolean(coverPreview) || false,
    [coverPreview]
  );

  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreview("");
      return;
    }
    const url = URL.createObjectURL(coverImageFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImageFile]);

  const updateIngredient = (idx, field, value) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", quantity: "" }]);
  };

  const removeIngredient = (idx) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!instructions.trim()) return "Instructions are required";
    if (ingredients.length === 0) return "At least one ingredient is required";
    const bad = ingredients.find(
      (ing) => !ing.name.trim() || !ing.quantity.trim()
    );
    if (bad) return "Each ingredient needs a name and a quantity";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setSubmitting(true);
      // Build multipart form data for multer backend
      const form = new FormData();
      form.append("title", title.trim());
      form.append(
        "ingredients",
        JSON.stringify(
          ingredients.map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity.trim(),
          }))
        )
      );
      form.append("instructions", instructions.trim());
      form.append("time", JSON.stringify({ ...time }));
      if (categories)
        form.append(
          "categories",
          JSON.stringify(
            categories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        );
      if (cuisine) form.append("cuisine", cuisine.trim());
      if (tags)
        form.append(
          "tags",
          JSON.stringify(
            tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        );
      if (coverImageFile) {
        form.append("coverImage", coverImageFile);
      }
      const res = await api.post("/recipe", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 201 || res.status === 200) {
        setSuccess("Recipe created successfully.");
        // small delay to show success then navigate
        setTimeout(() => navigate("/"), 750);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create recipe";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Add New Recipe
          </h1>
          <p className="text-neutral-300/80 mt-1">
            Fill in the details below. Fields marked with
            <span className="text-red-400"> *</span> are required.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6 shadow-xl"
        >
          {error ? (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-200">
              {success}
            </div>
          ) : null}

          {/* Preview (left/top) and Title (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left/top: Image preview + file input */}
            <div className="lg:col-span-1">
              <div className="block font-semibold text-neutral-200 mb-1">
                Cover Image
              </div>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/30">
                {canPreview ? (
                  <img
                    src={coverPreview}
                    alt="Recipe cover preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-neutral-400">
                    <span className="text-sm">No image selected</span>
                  </div>
                )}
              </div>
              <label className="block font-semibold text-neutral-200 mt-3 mb-1">
                Choose file
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-white/10 bg-black/30 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2.5 file:text-white file:hover:bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              />
              <p className="text-xs text-neutral-400 mt-1">
                PNG, JPG up to ~5MB
              </p>
            </div>

            {/* Right: Title */}
            <div className="lg:col-span-2">
              <label className="block font-semibold text-neutral-200 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Creamy Garlic Chicken Pasta"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              />
              {/* Instructions */}
              <div className="mt-6">
                <label className="block font-semibold text-neutral-200 mb-1">
                  Instructions <span className="text-red-200">*</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={
                    "Step-by-step method. You can separate steps by new lines."
                  }
                  className="min-h-70 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold text-neutral-200">
                Ingredients <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              >
                <span>+ Add ingredient</span>
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3"
                >
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(idx, "name", e.target.value)
                    }
                    placeholder="Name (e.g., Garlic)"
                    className="sm:col-span-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  />
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) =>
                      updateIngredient(idx, "quantity", e.target.value)
                    }
                    placeholder="Quantity (e.g., 2 cloves)"
                    className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  />
                  {ingredients.length > 1 && (
                    <div className="sm:col-span-5 -mt-1">
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="text-red-300/90 hover:text-red-200 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="mt-6">
            <label className="block font-semibold text-neutral-200 mb-1">
              Time
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={time.prep}
                onChange={(e) =>
                  setTime((t) => ({ ...t, prep: e.target.value }))
                }
                placeholder="Prep (e.g., 10 mins)"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              />
              <input
                type="text"
                value={time.cook}
                onChange={(e) =>
                  setTime((t) => ({ ...t, cook: e.target.value }))
                }
                placeholder="Cook (e.g., 20 mins)"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              />
              <input
                type="text"
                value={time.total}
                onChange={(e) =>
                  setTime((t) => ({ ...t, total: e.target.value }))
                }
                placeholder="Total (e.g., 30 mins)"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-200 mb-1">
                Categories (comma separated)
              </label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="e.g., Dessert, Quick"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-200 mb-1">
                Cuisine
              </label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g., Italian"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-200 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., spicy, gluten-free"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-semibold text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Recipe"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddNewRecipe;
