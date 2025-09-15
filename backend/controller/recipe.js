const Recipe = require("../models/recipe");

const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createRecipe = async (req, res) => {
  const { title, ingredients, instructions, time } = req.body;
  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }
  try {
    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      time,
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
  const { title, ingredients, instructions, time } = req.body;

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { title, ingredients, instructions, time },
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
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
};
