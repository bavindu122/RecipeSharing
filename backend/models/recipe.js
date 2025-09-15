const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: String,
          required: true,
        },
      },
    ],
    instructions: {
      type: String,
      required: true,
    },
    time: {
      prep: {
        type: String,
       
      },
      cook: {
        type: String,
        
      },
      total: {
        type: String,
        
      },
    },
    coverImage: {
      type: String,
     
    },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
