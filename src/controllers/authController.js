import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import AuthService from "../services/authService.js"; // Add the .js extension
import dotenv from "dotenv";
dotenv.config();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await AuthService.registerUser(username, email, password);
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AuthService.loginUser(email, password);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const isVerified = await AuthService.verifyTokenByLink(token);
    if (isVerified) {
      const userEmail = await AuthService.getUserEmailByVerificationToken(
        token
      );
      const user = await AuthService.getUserByEmail(userEmail);
      const accessToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ message: "Email verified successfully", token: accessToken });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/send-verification-email", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const newVerificationToken = Math.floor(100000 + Math.random() * 900000);
    await AuthService.updateUserVerificationTokenByEmail(
      email,
      newVerificationToken
    );

    await AuthService.sendNewVerificationToken(
      email,
      user.username,
      newVerificationToken
    );

    res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
