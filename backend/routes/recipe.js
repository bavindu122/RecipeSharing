const express = require("express");
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  upload
} = require("../controller/recipe");
const router = express.Router();

router.get("/", getRecipes);
router.get("/:id", getRecipeById);
router.post("/", upload.single("coverImage"), createRecipe);
router.put("/:id", upload.single("coverImage"), updateRecipe);
router.delete("/:id", deleteRecipe);

module.exports = router;
