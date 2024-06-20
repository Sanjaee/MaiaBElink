import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../utils/emailUtils.js"; // Adjust import statement

const prisma = new PrismaClient();

const AuthService = {
  registerUser: async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const verificationToken = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit token
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: String(verificationToken) },
    });

    await sendVerificationEmail(email, username, verificationToken);
  },

  loginUser: async (email, password) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
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
      const user = await prisma.user.findFirst({
        where: { verificationToken: String(token) },
      });
      if (!user) {
        throw new Error("Invalid token");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      return true;
    } catch (error) {
      throw new Error("Verification failed: " + error.message);
    }
  },

  getUserEmailByVerificationToken: async (token) => {
    try {
      const user = await prisma.user.findFirst({
        where: { verificationToken: String(token) },
      });
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
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  updateUserVerificationTokenByEmail: async (email, verificationToken) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error("User not found");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: String(verificationToken) },
      });
    } catch (error) {
      throw new Error(
        "Failed to update user verification token by email: " + error.message
      );
    }
  },

  sendNewVerificationToken: async (email, username, newVerificationToken) => {
    try {
      await sendVerificationEmail(email, username, newVerificationToken);
    } catch (error) {
      throw new Error(
        "Failed to send new verification token: " + error.message
      );
    }
  },
};

export default AuthService;
