const Recipe = require("../models/recipe");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "public", "images", "recipes");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch {}
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

// Advanced normalizer for ingredient names: unit stripping, singularization and synonym mapping
const UNIT_REGEX =
  /\b(tsp|tsps|teaspoon|teaspoons|tbsp|tbsps|tablespoon|tablespoons|cup|cups|g|kg|ml|l|litre|litres|oz|ounce|ounces|lb|pound|pounds|clove|cloves)\b/g;
const SYNONYMS = {
  chilli: "chili",
  chilies: "chili",
  chiles: "chili",
  capsicum: "bell pepper",
  peppers: "pepper",
  tomatoes: "tomato",
  onions: "onion",
  cloves: "clove",
};
function singularize(word = "") {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y"; // berries -> berry
  if (word.endsWith("ses")) return word.slice(0, -2); // classes -> class (rough)
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}
function normalizeIngredientName(s = "") {
  const base = s
    .toString()
    .toLowerCase()
    .replace(UNIT_REGEX, " ")
    .replace(/[\d/.-]+/g, " ") // remove numeric quantities/fractions
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "";
  const tokens = base.split(" ").map((t) => singularize(SYNONYMS[t] || t));
  // collapse common bigrams (e.g., bell pepper)
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair = tokens[i] + " " + tokens[i + 1];
    if (pair === "bell pepper") {
      tokens.splice(i, 2, "bell pepper");
    }
  }
  return Array.from(new Set(tokens)).join(" ").trim();
}

// Escape regex special chars in user input to avoid ReDoS and unexpected matches
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRecipes = async (req, res) => {
  try {
    const q = (req.query?.q || "").toString().trim();
    const filter = q
      ? { title: { $regex: escapeRegex(q), $options: "i" } }
      : {};
    const recipes = await Recipe.find(filter).populate("author", "userName");
    const enriched = recipes.map((r) => ({
      ...r.toObject(),
      likeCount: Array.isArray(r.likedBy) ? r.likedBy.length : 0,
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }
    const recipe = await Recipe.findById(id).populate("author", "userName");
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    // Increment view count (avoid awaiting separate save to keep latency low)
    Recipe.updateOne({ _id: recipe._id }, { $inc: { viewCount: 1 } }).exec();
    const likeCount = Array.isArray(recipe.likedBy) ? recipe.likedBy.length : 0;
    res.json({
      ...recipe.toObject(),
      likeCount,
      viewCount: (recipe.viewCount || 0) + 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createRecipe = async (req, res) => {
  let { title, ingredients, instructions, time, categories, cuisine, tags } =
    req.body;

  // When using multipart/form-data, ingredients/time may arrive as JSON strings
  try {
    if (typeof ingredients === "string") ingredients = JSON.parse(ingredients);
  } catch {}
  try {
    if (typeof time === "string") time = JSON.parse(time);
  } catch {}
  try {
    if (typeof categories === "string") categories = JSON.parse(categories);
  } catch {}
  if (!Array.isArray(categories) && typeof categories === "string")
    categories = categories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  try {
    if (typeof tags === "string") tags = JSON.parse(tags);
  } catch {}
  if (!Array.isArray(tags) && typeof tags === "string")
    tags = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  if (!title || !ingredients || !instructions) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }
  try {
    // compute normalized ingredients
    const normalizedIngredients = Array.isArray(ingredients)
      ? Array.from(
          new Set(
            ingredients
              .map((i) => normalizeIngredientName(i?.name || ""))
              .filter(Boolean)
          )
        )
      : [];
    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      time,
      coverImage: req.file ? `/images/recipes/${req.file.filename}` : undefined,
      categories: Array.isArray(categories) ? categories : [],
      cuisine: cuisine || undefined,
      tags: Array.isArray(tags) ? tags : [],
      normalizedIngredients,
      author: req.user?.id,
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// Placeholder functions for update and delete
// { "title": "Sample Recipe", "ingredients": [{"name": "Ingredient1", "quantity": "2 cups"}], "instructions": "Mix ingredients.", "time": {"prep": "10 mins", "cook": "20 mins", "total": "30 mins"} }
// { "title": "Updated Recipe Title", "ingredients": [{"name": "Ingredient1", "quantity": "3 cups"}], "instructions": "Updated instructions.", "time": {"prep": "15 mins", "cook": "25 mins", "total": "40 mins"} }

const updateRecipe = async (req, res) => {
  const { id } = req.params;
  let { title, ingredients, instructions, time, categories, cuisine, tags } =
    req.body;

  // Normalize potential JSON strings from multipart forms
  try {
    if (typeof ingredients === "string") ingredients = JSON.parse(ingredients);
  } catch {}
  try {
    if (typeof time === "string") time = JSON.parse(time);
  } catch {}
  try {
    if (typeof categories === "string") categories = JSON.parse(categories);
  } catch {}
  if (!Array.isArray(categories) && typeof categories === "string")
    categories = categories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  try {
    if (typeof tags === "string") tags = JSON.parse(tags);
  } catch {}
  if (!Array.isArray(tags) && typeof tags === "string")
    tags = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const updateDoc = { title, ingredients, instructions, time };
  if (Array.isArray(categories)) updateDoc.categories = categories;
  if (typeof cuisine === "string") updateDoc.cuisine = cuisine;
  if (Array.isArray(tags)) updateDoc.tags = tags;
  if (req.file) {
    updateDoc.coverImage = `/images/recipes/${req.file.filename}`;
  }

  // recompute normalizedIngredients if ingredients provided
  if (Array.isArray(ingredients)) {
    updateDoc.normalizedIngredients = Array.from(
      new Set(
        ingredients
          .map((i) => normalizeIngredientName(i?.name || ""))
          .filter(Boolean)
      )
    );
  }

  try {
    // Optionally enforce ownership: only allow author to update
    const existing = await Recipe.findById(id);
    if (!existing) return res.status(404).json({ message: "Recipe not found" });
    if (
      existing.author &&
      req.user?.id &&
      existing.author.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateDoc, {
      new: true,
    });
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await Recipe.findById(id);
    if (!existing) return res.status(404).json({ message: "Recipe not found" });
    if (
      existing.author &&
      req.user?.id &&
      existing.author.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await existing.deleteOne();
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get recipes belonging to the authenticated user
const getMyRecipes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const recipes = await Recipe.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "userName");
    const enriched = recipes.map((r) => ({
      ...r.toObject(),
      likeCount: Array.isArray(r.likedBy) ? r.likedBy.length : 0,
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle like/unlike for a recipe by the authenticated user
const toggleLike = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const idx = (recipe.likedBy || []).findIndex(
      (u) => u.toString() === userId
    );
    let liked;
    if (idx >= 0) {
      recipe.likedBy.splice(idx, 1);
      liked = false;
    } else {
      recipe.likedBy = recipe.likedBy || [];
      recipe.likedBy.push(userId);
      liked = true;
    }
    await recipe.save();
    return res.json({
      liked,
      likeCount: recipe.likedBy.length,
      recipeId: recipe._id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get favorite recipes for the authenticated user
const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const recipes = await Recipe.find({ likedBy: userId })
      .sort({ createdAt: -1 })
      .populate("author", "userName");
    const enriched = recipes.map((r) => ({
      ...r.toObject(),
      likeCount: Array.isArray(r.likedBy) ? r.likedBy.length : 0,
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
  toggleLike,
  getMyFavorites,
  upload,
};
