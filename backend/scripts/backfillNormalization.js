/**
 * Backfill normalizedIngredients, basic categories & tags heuristics.
 * Run: node backend/scripts/backfillNormalization.js
 */
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const Recipe = require("../models/recipe");

// Duplicate of logic (keep in sync with controller)
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
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}
function normalizeIngredientName(s = "") {
  const base = s
    .toString()
    .toLowerCase()
    .replace(UNIT_REGEX, " ")
    .replace(/[\d/.-]+/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "";
  const tokens = base.split(" ").map((t) => singularize(SYNONYMS[t] || t));
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair = tokens[i] + " " + tokens[i + 1];
    if (pair === "bell pepper") tokens.splice(i, 2, "bell pepper");
  }
  return Array.from(new Set(tokens)).join(" ").trim();
}

function inferCategories(recipe) {
  const cats = new Set(recipe.categories || []);
  const title = (recipe.title || "").toLowerCase();
  if (/salad/.test(title)) cats.add("Salad");
  if (/soup/.test(title)) cats.add("Soup");
  if (/bowl/.test(title)) cats.add("Bowl");
  if (/pizza/.test(title)) cats.add("Baked");
  if (/taco/.test(title)) cats.add("Street Food");
  return Array.from(cats);
}
function inferTags(recipe) {
  const tags = new Set(recipe.tags || []);
  const ing = (recipe.ingredients || []).map((i) => i.name.toLowerCase());
  if (ing.some((i) => /shrimp|prawn/.test(i))) tags.add("seafood");
  if (ing.some((i) => /lentil/.test(i))) tags.add("fiber");
  if (ing.some((i) => /avocado/.test(i))) tags.add("healthy");
  if ((recipe.instructions || "").length < 180) tags.add("quick");
  return Array.from(tags);
}

(async () => {
  const connStr =
    process.env.CONNECTION_STRING || "mongodb://127.0.0.1:27017/recipe_sharing";
  console.log("Connecting to", connStr);
  await mongoose.connect(connStr);
  const cursor = Recipe.find({}).cursor();
  let updated = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const norm = Array.from(
      new Set(
        (doc.ingredients || [])
          .map((i) => normalizeIngredientName(i.name))
          .filter(Boolean)
      )
    );
    const newCats = inferCategories(doc);
    const newTags = inferTags(doc);
    let changed = false;
    if (
      norm.length &&
      JSON.stringify(norm) !== JSON.stringify(doc.normalizedIngredients || [])
    ) {
      doc.normalizedIngredients = norm;
      changed = true;
    }
    if (
      JSON.stringify(newCats.sort()) !==
      JSON.stringify((doc.categories || []).sort())
    ) {
      doc.categories = newCats;
      changed = true;
    }
    if (
      JSON.stringify(newTags.sort()) !== JSON.stringify((doc.tags || []).sort())
    ) {
      doc.tags = newTags;
      changed = true;
    }
    if (typeof doc.viewCount !== "number") {
      doc.viewCount = 0;
      changed = true;
    }
    if (changed) {
      await doc.save();
      updated++;
    }
  }
  console.log("Backfill complete. Updated docs:", updated);
  await mongoose.disconnect();
  process.exit(0);
})();
