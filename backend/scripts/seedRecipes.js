/**
 * Seed sample recipes.
 * Run: node backend/scripts/seedRecipes.js
 * Uses CONNECTION_STRING from .env (same as app) or falls back to local.
 * Idempotent: removes existing recipes with the same titles before inserting.
 */
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const Recipe = require("../models/recipe");
const User = require("../models/user");

const sample = [
  {
    title: "Creamy Garlic Parmesan Pasta",
    ingredients: [
      { name: "spaghetti", quantity: "300 g" },
      { name: "butter", quantity: "2 tbsp" },
      { name: "garlic cloves", quantity: "4 minced" },
      { name: "heavy cream", quantity: "1 cup" },
      { name: "parmesan cheese", quantity: "3/4 cup grated" },
      { name: "salt", quantity: "to taste" },
      { name: "black pepper", quantity: "to taste" },
      { name: "fresh parsley", quantity: "2 tbsp chopped" },
    ],
    instructions:
      "Cook pasta until al dente. Melt butter and sauté garlic. Pour in cream, simmer gently. Stir in parmesan until smooth. Toss pasta, adjust seasoning, garnish with parsley.",
    time: { prep: "10m", cook: "15m", total: "25m" },
    categories: ["Dinner", "Quick"],
    cuisine: "Italian",
    tags: ["creamy", "vegetarian", "comfort"],
  },
  {
    title: "Spicy Chickpea Buddha Bowl",
    ingredients: [
      { name: "chickpeas (cooked)", quantity: "2 cups" },
      { name: "smoked paprika", quantity: "1 tsp" },
      { name: "ground cumin", quantity: "1 tsp" },
      { name: "olive oil", quantity: "1 tbsp" },
      { name: "quinoa (cooked)", quantity: "1.5 cups" },
      { name: "baby spinach", quantity: "2 cups" },
      { name: "avocado", quantity: "1 sliced" },
      { name: "red cabbage", quantity: "1/2 cup shredded" },
      { name: "tahini", quantity: "2 tbsp" },
      { name: "lemon juice", quantity: "1 tbsp" },
    ],
    instructions:
      "Toss chickpeas with oil, paprika, cumin; roast or pan-toast. Arrange quinoa, greens, vegetables, chickpeas. Whisk tahini + lemon + water; drizzle.",
    time: { prep: "12m", cook: "8m", total: "20m" },
    categories: ["Lunch", "Healthy"],
    cuisine: "Fusion",
    tags: ["vegan", "high-protein", "bowl"],
  },
  {
    title: "Classic Margherita Pizza",
    ingredients: [
      { name: "pizza dough", quantity: "1 ball (300 g)" },
      { name: "tomato sauce", quantity: "1/2 cup" },
      { name: "fresh mozzarella", quantity: "120 g" },
      { name: "fresh basil leaves", quantity: "8–10" },
      { name: "olive oil", quantity: "1 tbsp" },
      { name: "sea salt", quantity: "pinch" },
    ],
    instructions:
      "Stretch dough. Spread thin layer tomato sauce. Add torn mozzarella. Bake on hot stone (250°C) until blistered. Finish with basil and olive oil.",
    time: { prep: "15m", cook: "10m", total: "25m" },
    categories: ["Dinner"],
    cuisine: "Italian",
    tags: ["baked", "vegetarian", "simple"],
  },
  {
    title: "Thai Green Curry with Vegetables",
    ingredients: [
      { name: "green curry paste", quantity: "2 tbsp" },
      { name: "coconut milk", quantity: "400 ml" },
      { name: "broccoli florets", quantity: "1 cup" },
      { name: "red bell pepper", quantity: "1 sliced" },
      { name: "zucchini", quantity: "1 sliced" },
      { name: "bamboo shoots", quantity: "1/2 cup" },
      { name: "thai basil", quantity: "handful" },
      { name: "lime juice", quantity: "1 tbsp" },
      { name: "soy sauce", quantity: "1 tbsp" },
    ],
    instructions:
      "Simmer curry paste in a little coconut milk. Add remaining coconut milk and vegetables; cook until tender-crisp. Season with soy + lime. Finish with Thai basil.",
    time: { prep: "12m", cook: "18m", total: "30m" },
    categories: ["Dinner"],
    cuisine: "Thai",
    tags: ["spicy", "gluten-free", "curry"],
  },
  {
    title: "Herb-Roasted Chicken Thighs",
    ingredients: [
      { name: "chicken thighs (bone-in)", quantity: "6" },
      { name: "olive oil", quantity: "2 tbsp" },
      { name: "garlic cloves", quantity: "3 minced" },
      { name: "rosemary", quantity: "1 tsp chopped" },
      { name: "thyme", quantity: "1 tsp chopped" },
      { name: "lemon zest", quantity: "1 tsp" },
      { name: "salt", quantity: "1 tsp" },
      { name: "black pepper", quantity: "1/2 tsp" },
    ],
    instructions:
      "Mix oil, garlic, herbs, lemon zest, salt, pepper. Coat chicken. Roast at 200°C until skin crisp and internal temp 74°C.",
    time: { prep: "10m", cook: "35m", total: "45m" },
    categories: ["Dinner", "Protein"],
    cuisine: "American",
    tags: ["roasted", "meal-prep", "high-protein"],
  },
  {
    title: "Avocado Toast with Poached Egg",
    ingredients: [
      { name: "sourdough slices", quantity: "2" },
      { name: "ripe avocado", quantity: "1" },
      { name: "eggs", quantity: "2" },
      { name: "lemon juice", quantity: "1 tsp" },
      { name: "chili flakes", quantity: "pinch" },
      { name: "salt", quantity: "to taste" },
      { name: "pepper", quantity: "to taste" },
    ],
    instructions:
      "Mash avocado with lemon, salt, pepper. Poach eggs. Toast bread, spread avocado, top with egg and chili flakes.",
    time: { prep: "5m", cook: "6m", total: "11m" },
    categories: ["Breakfast", "Quick"],
    cuisine: "Fusion",
    tags: ["brunch", "protein", "simple"],
  },
  {
    title: "Mediterranean Quinoa Salad",
    ingredients: [
      { name: "quinoa (cooked)", quantity: "2 cups" },
      { name: "cucumber", quantity: "1 diced" },
      { name: "cherry tomatoes", quantity: "1 cup halved" },
      { name: "kalamata olives", quantity: "1/3 cup sliced" },
      { name: "feta cheese", quantity: "1/2 cup crumbled" },
      { name: "red onion", quantity: "1/4 cup finely diced" },
      { name: "olive oil", quantity: "3 tbsp" },
      { name: "lemon juice", quantity: "2 tbsp" },
      { name: "oregano (dry)", quantity: "1/2 tsp" },
    ],
    instructions:
      "Combine quinoa and chopped vegetables. Whisk oil, lemon, oregano, salt, pepper. Toss with feta and olives.",
    time: { prep: "15m", cook: "0m", total: "15m" },
    categories: ["Lunch", "Healthy"],
    cuisine: "Mediterranean",
    tags: ["salad", "vegetarian", "fresh"],
  },
  {
    title: "Beef Stir-Fry with Ginger Soy",
    ingredients: [
      { name: "flank steak", quantity: "350 g sliced" },
      { name: "soy sauce", quantity: "3 tbsp" },
      { name: "ginger", quantity: "1 tbsp grated" },
      { name: "garlic", quantity: "3 cloves minced" },
      { name: "brown sugar", quantity: "1 tbsp" },
      { name: "broccoli florets", quantity: "1.5 cups" },
      { name: "carrot", quantity: "1 sliced" },
      { name: "sesame oil", quantity: "1 tsp" },
    ],
    instructions:
      "Marinate beef in soy, ginger, garlic, sugar (10m). Stir-fry beef hot; remove. Stir-fry vegetables. Return beef, add sesame oil, toss.",
    time: { prep: "15m", cook: "10m", total: "25m" },
    categories: ["Dinner", "Protein"],
    cuisine: "Asian",
    tags: ["stir-fry", "quick", "umami"],
  },
  {
    title: "Chocolate Overnight Oats",
    ingredients: [
      { name: "rolled oats", quantity: "1 cup" },
      { name: "milk (dairy or alt)", quantity: "1 cup" },
      { name: "chia seeds", quantity: "1 tbsp" },
      { name: "cocoa powder", quantity: "1 tbsp" },
      { name: "maple syrup", quantity: "1–2 tbsp" },
      { name: "vanilla extract", quantity: "1/2 tsp" },
      { name: "dark chocolate chips", quantity: "2 tbsp" },
    ],
    instructions:
      "Mix all in jar. Refrigerate overnight. Stir and top with more chocolate or berries.",
    time: { prep: "5m", cook: "0m", total: "5m + chill" },
    categories: ["Breakfast", "Snack"],
    cuisine: "American",
    tags: ["make-ahead", "sweet", "fiber"],
  },
  {
    title: "Lentil & Spinach Soup",
    ingredients: [
      { name: "brown lentils", quantity: "1 cup rinsed" },
      { name: "onion", quantity: "1 diced" },
      { name: "garlic", quantity: "3 cloves minced" },
      { name: "carrot", quantity: "1 diced" },
      { name: "celery stalk", quantity: "1 diced" },
      { name: "vegetable broth", quantity: "5 cups" },
      { name: "cumin", quantity: "1 tsp" },
      { name: "baby spinach", quantity: "2 cups" },
    ],
    instructions:
      "Sauté onion, carrot, celery, garlic. Add lentils, broth, cumin. Simmer until tender. Stir in spinach to wilt, season.",
    time: { prep: "10m", cook: "30m", total: "40m" },
    categories: ["Dinner", "Healthy"],
    cuisine: "Middle Eastern",
    tags: ["soup", "vegan", "high-fiber"],
  },
  {
    title: "Mango Salsa Fish Tacos",
    ingredients: [
      { name: "white fish fillets", quantity: "400 g" },
      { name: "lime juice", quantity: "2 tbsp" },
      { name: "chili powder", quantity: "1 tsp" },
      { name: "cabbage (shredded)", quantity: "1 cup" },
      { name: "mango", quantity: "1 diced" },
      { name: "red onion", quantity: "2 tbsp minced" },
      { name: "cilantro", quantity: "2 tbsp chopped" },
      { name: "small tortillas", quantity: "8" },
    ],
    instructions:
      "Marinate fish with lime + chili. Cook until flaky. Mix mango, onion, cilantro, lime pinch. Assemble tortillas with fish, cabbage, salsa.",
    time: { prep: "15m", cook: "10m", total: "25m" },
    categories: ["Dinner"],
    cuisine: "Mexican",
    tags: ["tacos", "fresh", "seafood"],
  },
  {
    title: "Garlic Butter Shrimp Rice Bowl",
    ingredients: [
      { name: "shrimp (peeled)", quantity: "350 g" },
      { name: "garlic cloves", quantity: "4 minced" },
      { name: "butter", quantity: "2 tbsp" },
      { name: "paprika", quantity: "1/2 tsp" },
      { name: "cooked rice", quantity: "2 cups" },
      { name: "green onions", quantity: "2 tbsp sliced" },
      { name: "lemon juice", quantity: "1 tsp" },
    ],
    instructions:
      "Melt butter, sauté garlic. Add shrimp + paprika; cook until pink. Finish with lemon. Serve over rice, garnish green onions.",
    time: { prep: "8m", cook: "7m", total: "15m" },
    categories: ["Dinner", "Quick"],
    cuisine: "Fusion",
    tags: ["seafood", "one-bowl", "fast"],
  },
];

// Simple ingredient normalization similar to controller logic
function normalizeIngredients(list) {
  return list
    .map((i) =>
      (i.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

(async () => {
  const connStr =
    process.env.CONNECTION_STRING ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/recipe_sharing";
  console.log("Connecting to:", connStr);
  try {
    await mongoose.connect(connStr);
    console.log("Connected");
    // Pick any existing user as author (or leave null)
    const anyUser = await User.findOne();
    const authorId = anyUser?._id || null;

    const titles = sample.map((r) => r.title);
    const existing = await Recipe.find(
      { title: { $in: titles } },
      { title: 1 }
    );
    const existingTitles = new Set(existing.map((d) => d.title));
    if (existing.length) {
      console.log(
        `Removing ${existing.length} existing sample recipes (by title match)...`
      );
      await Recipe.deleteMany({ title: { $in: titles } });
    }

    const docs = sample.map((r) => ({
      ...r,
      author: authorId,
      likedBy: [],
      normalizedIngredients: normalizeIngredients(r.ingredients || []),
    }));

    await Recipe.insertMany(docs, { ordered: true });
    console.log(`Inserted ${docs.length} recipes.`);
    if (!authorId) {
      console.log(
        "NOTE: No user found, 'author' is null. Create a user before seeding if you want ownership."
      );
    } else {
      console.log("Author assigned:", authorId.toString());
    }
  } catch (e) {
    console.error("Seed error:", e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
