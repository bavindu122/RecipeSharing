const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controller/user");
const router = express.Router();
const verifyToken = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile/:id", verifyToken, getUserProfile);

module.exports = router;
