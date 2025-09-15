const express = require("express");
const app = express();
const dotenv = require("dotenv")
const connectDB =require("./config/connectionDB")

dotenv.config();

const port = process.env.port || 3000;
connectDB();

app.use(express.json());

app.use("/recipe", require("./routes/recipe"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 