// authController.js
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "../utils/cloudinaryConfig.js";

// Logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Update Profile
export const updateProfile = async (req, res) => {
  const { userId, username, firstname, lastname, email, address, phone } = req.body;
  const image = req.file;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.username = username || user.username;
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    // Check if address is provided. If it's a string, parse it into an object.
    user.address = address
      ? (typeof address === 'string' ? JSON.parse(address) : address)
      : user.address;
    user.phone = phone || user.phone;

    if (image) {
      if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }
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
        stream.end(image.buffer);
      });

      user.image = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};


// Get All Users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(new ErrorHandler("Error fetching users", 500));
  }
};

// Get User by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // include password if needed
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Store FCM Token
export const storeFCM = async (req, res) => {
  const { token, id } = req.body;
  console.log("FCM Token:", token, "User ID:", id);
  // return;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if(user.FCMtoken === token) {
      return res.status(200).json({
        success: true,
        message: "FCM token already exists",
        data: user.FCMtoken,
      });
    }
    user.FCMtoken = token;
    await user.save();
    res.status(200).json({
      success: true,
      message: "FCM token stored successfully",
      data: user.FCMtoken,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

