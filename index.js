// src/index.js
const express = require("express");
const bodyParser = require("body-parser");
const authController = require("./src/controllers/authController");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth", authController);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
