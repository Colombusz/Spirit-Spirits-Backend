// loginController.js
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { auth } from "../utils/firebase.js";
import cloudinary from "../utils/cloudinaryConfig.js";

export const signup = async (req, res) => {
  // Destructure the new fields along with the existing ones
  const { username, firstname, lastname, email, password, address, phone, image } = req.body;
  
  try {
    // Check required fields
    if (!username || !firstname || !lastname || !email || !password) {
      throw new Error("All fields are required");
    }

    // Check if a user with this email already exists
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user data with address and phone fields
    const userData = {
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      address: address || {}, // expects an object { street, city, postalCode, country }
      phone: phone || '',
      isVerified: true,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Handle image upload:
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_image" },
          (error, result) => {
            if (error) {
              reject(new Error("Error uploading avatar to Cloudinary"));
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });
      userData.image = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    } else if (image && image.url) {
      userData.image = image;
    } else {
      userData.image = {};
    }

    // Create a new user instance with all fields
    const user = new User(userData);
    await user.save();

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
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
    console.log("User:", user);
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
    const token = generateTokenAndSetCookie(res, user);

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isAdmin
        ? "Logged in successfully as admin"
        : "Logged in successfully as user",
      token,
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
  const { firebaseIdToken } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(firebaseIdToken);
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

      // Create a new user if not found, providing default values for new fields.
      user = new User({
        username,
        firstname,
        lastname,
        email,
        password: randomPassword,
        firebaseUid,
        address: {}, 
        isVerified: true,
      });

      await user.save();
    }

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
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
