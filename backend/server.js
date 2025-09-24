const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/connectionDB");
const cors = require("cors");
const path = require("path");

dotenv.config();
app.use(cors());

const port = process.env.PORT || 3000;

// connect to DB and handle errors
connectDB().catch((err) => console.error("DB connection failed:", err));

app.use(express.json());
// serve uploaded images
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/user", require("./routes/user"));
app.use("/recipe", require("./routes/recipe"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
