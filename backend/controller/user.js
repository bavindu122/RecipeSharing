const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { email, password, userName } = req.body;
    if (!email || !password || !userName) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, userName });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, userName: newUser.userName },
      process.env.JWT_SECRET || "dev_secret",
      {
        expiresIn: "1h",
      }
    );

    res
      .status(201)
      .json({ token, userId: newUser._id, userName: newUser.userName });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.JWT_SECRET || "dev_secret",
      {
        expiresIn: "1h",
      }
    );

    res.json({ token, userId: user._id, userName: user.userName });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("getUserProfile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
