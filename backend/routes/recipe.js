const express = require("express");
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  upload,
} = require("../controller/recipe");
const router = express.Router();
const verifyToken = require("../middleware/auth");

router.get("/", getRecipes);
router.get("/:id", getRecipeById);
// Verify auth BEFORE handling file uploads to avoid saving files on unauthorized requests
router.post("/", verifyToken, upload.single("coverImage"), createRecipe);
router.put("/:id", verifyToken, upload.single("coverImage"), updateRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

module.exports = router;
