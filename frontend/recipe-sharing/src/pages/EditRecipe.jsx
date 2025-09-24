import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const normalizeList = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string")
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

export const EditRecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [instructions, setInstructions] = useState("");
  const [time, setTime] = useState({ prep: "", cook: "", total: "" });
  const [categories, setCategories] = useState([]);
  const [cuisine, setCuisine] = useState("");
  const [tags, setTags] = useState([]);
  // Raw input text so user can type trailing commas without it being stripped
  const [categoriesInput, setCategoriesInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Simple client validation state
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/recipe/${id}`);
        if (!mounted) return;
        setTitle(data?.title || "");
        setInstructions(data?.instructions || "");
        setTime({
          prep: data?.time?.prep || "",
          cook: data?.time?.cook || "",
          total: data?.time?.total || "",
        });
        setIngredients(
          Array.isArray(data?.ingredients) && data.ingredients.length
            ? data.ingredients
            : [{ name: "", quantity: "" }]
        );
        const catArr = Array.isArray(data?.categories) ? data.categories : [];
        setCategories(catArr);
        setCategoriesInput(catArr.join(", "));
        setCuisine(data?.cuisine || "");
        const tagArr = Array.isArray(data?.tags) ? data.tags : [];
        setTags(tagArr);
        setTagsInput(tagArr.join(", "));
        const apiBase =
          import.meta.env.VITE_API_BASE || "http://localhost:5000";
        const img = data?.coverImage
          ? data.coverImage.startsWith("http")
            ? data.coverImage
            : `${apiBase}${data.coverImage}`
          : "";
        setCoverPreview(img);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load recipe");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!coverImageFile) return;
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

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { name: "", quantity: "" }]);
  const removeIngredient = (idx) =>
    setIngredients((prev) => prev.filter((_, i) => i !== idx));

  const moveIngredient = (idx, direction) => {
    setIngredients((prev) => {
      const next = [...prev];
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      const temp = next[newIdx];
      next[newIdx] = next[idx];
      next[idx] = temp;
      return next;
    });
  };

  const invalidIngredients = ingredients.some((i) => !i.name.trim());
  const isFormInvalid =
    !title.trim() || !instructions.trim() || invalidIngredients;

  const parseListInput = (val) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    if (isFormInvalid) return;
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("instructions", instructions);
      formData.append("time", JSON.stringify(time));
      formData.append("categories", JSON.stringify(categories));
      formData.append("cuisine", cuisine);
      formData.append("tags", JSON.stringify(tags));
      if (coverImageFile) formData.append("coverImage", coverImageFile);

      await api.put(`/recipe/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/recipe/${id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="px-6 py-10 text-center text-sm text-neutral-400">
        Loading…
      </div>
    );

  const inputBase =
    "w-full rounded-md bg-neutral-900/60 border border-white/10 focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/40 px-3 py-2 text-sm outline-none transition";
  const labelCls = "block text-sm font-semibold mb-1 text-neutral-200";
  const sectionTitle =
    "text-base font-semibold tracking-wide text-neutral-300 flex items-center gap-2";
  const smallHelp = "mt-1 text-[11px] uppercase tracking-wide text-neutral-500";
  const errorText = "mt-1 text-xs text-red-400 font-medium";

  return (
    <section className="py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Edit Recipe
          </h1>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary !px-5 !py-2 rounded-full text-sm"
            >
              Back
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIngredients([{ name: "", quantity: "" }]);
              }}
              className="hidden md:inline-flex text-[11px] tracking-wide uppercase font-semibold px-3 py-1.5 rounded-full bg-neutral-800/70 border border-white/10 hover:border-white/20 transition"
            >
              Reset Ingredients
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="grid lg:grid-cols-3 gap-8 items-start"
        >
          {/* Main Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="space-y-4 p-5 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm">
              <h2 className={sectionTitle}>Basic Information</h2>
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  className={inputBase}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Creamy Garlic Pasta"
                />
                {formTouched && !title.trim() && (
                  <p className={errorText}>Title is required.</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Instructions *</label>
                <textarea
                  className={
                    inputBase + " min-h-[180px] resize-y leading-relaxed"
                  }
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step-by-step cooking directions..."
                />
                {formTouched && !instructions.trim() && (
                  <p className={errorText}>Instructions are required.</p>
                )}
                <p className={smallHelp}>{instructions.length} characters</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4 p-5 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className={sectionTitle}>Ingredients</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--primary-blue)]/90 hover:bg-[var(--primary-blue)] text-white transition"
                  >
                    Add Row
                  </button>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredients.length - 1)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700/70 border border-white/10 text-neutral-200 transition"
                    >
                      Remove Last
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {ingredients.map((ing, idx) => {
                  const nameInvalid = formTouched && !ing.name.trim();
                  return (
                    <div
                      key={idx}
                      className="group grid grid-cols-12 gap-2 items-start bg-neutral-800/30 border border-white/5 rounded-lg px-3 py-3 relative"
                    >
                      <div className="col-span-5 flex flex-col">
                        <input
                          className={
                            inputBase +
                            (nameInvalid ? " border-red-500/60" : "")
                          }
                          placeholder="Ingredient"
                          value={ing.name}
                          onChange={(e) =>
                            updateIngredient(idx, "name", e.target.value)
                          }
                        />
                        {nameInvalid && (
                          <p className="text-[10px] mt-1 text-red-400 tracking-wide">
                            Required
                          </p>
                        )}
                      </div>
                      <div className="col-span-4">
                        <input
                          className={inputBase}
                          placeholder="Quantity"
                          value={ing.quantity}
                          onChange={(e) =>
                            updateIngredient(idx, "quantity", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-3 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => moveIngredient(idx, -1)}
                          disabled={idx === 0}
                          className="px-2 py-1 text-[11px] rounded-md bg-neutral-700/60 disabled:opacity-30 hover:bg-neutral-600/70"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveIngredient(idx, 1)}
                          disabled={idx === ingredients.length - 1}
                          className="px-2 py-1 text-[11px] rounded-md bg-neutral-700/60 disabled:opacity-30 hover:bg-neutral-600/70"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          className="px-2 py-1 text-[11px] rounded-md bg-red-600/70 hover:bg-red-600 text-white"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className={smallHelp}>
                Drag & reorder not yet supported. Use Up / Down buttons.
              </p>
            </div>

            {/* Timing + Metadata */}
            <div className="space-y-6 p-5 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm">
              <h2 className={sectionTitle}>Timing & Metadata</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Prep Time</label>
                  <input
                    className={inputBase}
                    value={time.prep}
                    onChange={(e) => setTime({ ...time, prep: e.target.value })}
                    placeholder="e.g. 15m"
                  />
                </div>
                <div>
                  <label className={labelCls}>Cook Time</label>
                  <input
                    className={inputBase}
                    value={time.cook}
                    onChange={(e) => setTime({ ...time, cook: e.target.value })}
                    placeholder="e.g. 30m"
                  />
                </div>
                <div>
                  <label className={labelCls}>Total Time</label>
                  <input
                    className={inputBase}
                    value={time.total}
                    onChange={(e) =>
                      setTime({ ...time, total: e.target.value })
                    }
                    placeholder="e.g. 45m"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Categories</label>
                  <input
                    className={inputBase}
                    value={categoriesInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCategoriesInput(v);
                      setCategories(parseListInput(v));
                    }}
                    placeholder="Breakfast, Quick"
                  />
                </div>
                <div>
                  <label className={labelCls}>Cuisine</label>
                  <input
                    className={inputBase}
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="Italian"
                  />
                </div>
                <div>
                  <label className={labelCls}>Tags</label>
                  <input
                    className={inputBase}
                    value={tagsInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTagsInput(v);
                      setTags(parseListInput(v));
                    }}
                    placeholder="creamy, vegetarian"
                  />
                </div>
              </div>
              <p className={smallHelp}>Separate multiple values with commas.</p>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm">
              <h2 className={sectionTitle}>Cover Image</h2>
              <div className="mt-3">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="cover"
                    className="w-full aspect-video object-cover rounded-lg border border-white/10"
                  />
                ) : (
                  <div className="w-full aspect-video grid place-items-center rounded-lg border border-dashed border-white/15 text-neutral-500 text-sm">
                    No image
                  </div>
                )}
                <label className="mt-3 flex flex-col items-center justify-center gap-2 text-sm rounded-lg border border-dashed border-white/15 py-5 cursor-pointer hover:border-[var(--primary-blue)]/60 hover:bg-neutral-800/40 transition">
                  <span className="font-medium text-neutral-300">
                    {coverImageFile ? "Change Image" : "Upload Image"}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-neutral-500">
                    PNG / JPG / WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setCoverImageFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm sticky top-24">
              <h2 className={sectionTitle}>Actions</h2>
              <div className="mt-4 flex flex-col gap-3">
                {formTouched && isFormInvalid && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-md">
                    Please correct required fields before saving.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={saving || isFormInvalid}
                  className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed !rounded-full !py-2.5 !px-6 text-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary !rounded-full !py-2.5 !px-6 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditRecipe;
