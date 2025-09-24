const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: String, trim: true },
});

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    ingredients: { type: [IngredientSchema], default: [] },
    // normalized tokens for matching (lowercased, de-unitized)
    normalizedIngredients: { type: [String], default: [], index: true },
    instructions: { type: String, required: true },
    time: {
      prep: String,
      cook: String,
      total: String,
    },
    coverImage: { type: String }, // /images/recipes/<file> or URL
    categories: { type: [String], default: [], index: true },
    cuisine: { type: String, trim: true, index: true },
    tags: { type: [String], default: [], index: true },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
