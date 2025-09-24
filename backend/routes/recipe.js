const express = require("express");
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
  toggleLike,
  getMyFavorites,
  upload,
} = require("../controller/recipe");
const router = express.Router();
const verifyToken = require("../middleware/auth");

router.get("/", getRecipes);
router.get("/mine", verifyToken, getMyRecipes);
router.get("/favorites/mine", verifyToken, getMyFavorites);
router.get("/:id", getRecipeById);
// Verify auth BEFORE handling file uploads to avoid saving files on unauthorized requests
router.post("/", verifyToken, upload.single("coverImage"), createRecipe);
router.post("/:id/like", verifyToken, toggleLike);
router.put("/:id", verifyToken, upload.single("coverImage"), updateRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

module.exports = router;
