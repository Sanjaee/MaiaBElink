// services/authService.js
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");
const EmailUtils = require("../utils/emailUtils");

module.exports = {
  registerUser: async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(username, email, hashedPassword);

    const verificationToken = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit token
    await UserModel.updateUserVerificationToken(user.id, verificationToken);

    await EmailUtils.sendVerificationEmail(email, username, verificationToken);
  },

  loginUser: async (email, password) => {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    if (!user.isVerified) {
      throw new Error("Email is not verified");
    }

    return user;
  },

  verifyTokenByLink: async (token) => {
    try {
      const user = await UserModel.findUserByVerificationToken(token);
      if (!user) {
        throw new Error("Invalid token");
      }

      await UserModel.updateUserVerificationStatus(user.id);
      return true;
    } catch (error) {
      throw new Error("Verification failed: " + error.message);
    }
  },

  getUserEmailByVerificationToken: async (token) => {
    try {
      const user = await UserModel.findUserByVerificationToken(token);
      if (!user) {
        throw new Error("User not found for the provided verification token");
      }
      return user.email;
    } catch (error) {
      throw new Error(
        "Error while fetching user email by verification token: " +
          error.message
      );
    }
  },

  getUserByEmail: async (email) => {
    return await UserModel.findUserByEmail(email);
  },
};
