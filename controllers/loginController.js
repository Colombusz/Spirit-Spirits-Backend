// loginController.js
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../utils/emails.js";
import { auth } from "../utils/firebase.js";

export const signup = async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;
  try {
    if (!username || !firstname || !lastname || !email || !password) {
      throw new Error("All fields are required");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    await user.save();

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, user.verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isAdmin
        ? "Logged in successfully as admin"
        : "Logged in successfully as user",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const googlelogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const firebaseUid = decodedToken.uid;

    let user = await User.findOne({ email });
    if (!user) {
      const fullName = decodedToken.name || "Google User";
      const [firstname, lastname = ""] = fullName.split(" ", 2);

      let username = fullName.replace(/\s+/g, "_").toLowerCase();
      let usernameExists = await User.findOne({ username });
      while (usernameExists) {
        username = `${username}_${crypto.randomBytes(3).toString("hex")}`;
        usernameExists = await User.findOne({ username });
      }

      // Generate a secure random password
      const randomPassword = crypto.randomBytes(8).toString("hex");

      // Create a new user if not found
      user = new User({
        username,
        firstname,
        lastname,
        email,
        password: randomPassword,
        firebaseUid,
        address: "N/A", // Default address
        isVerified: true,
      });

      await user.save();
    }

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error verifying Google ID token:", error);
    res
      .status(400)
      .json({ success: false, message: "Invalid Google ID token" });
  }
};
