import Promo from '../models/promoModel.js'; // Make sure this exists
import cloudinary from '../utils/cloudinaryConfig.js';
import User from '../models/userModel.js'; // Only if you’ll use notifications
import Liquor from '../models/liquorModel.js';
import { sendPushNotification } from "./NotifMessageHandler.js";
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    stream.end(buffer);
  });
};


export const createPromo = async (req, res) => {
  try {
    const { name, discountRate, category, description } = req.body;

    console.log("Creating Promo with data:", req.body);
    console.log("Uploaded files:", req.files);

    // Validate required fields
    if (!name || !discountRate || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fields: name, discountRate, category, and description.",
      });
    }

    // Upload images to Cloudinary
    let imageLinks = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer); // Assumes buffer-based upload
          imageLinks.push({ public_id: result.public_id, url: result.secure_url });
        } catch (error) {
          console.error("Cloudinary upload error:", error.message);
          return res.status(500).json({
            success: false,
            message: "Image upload failed. Please try again.",
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "At least one image is required for the promo.",
      });
    }

    // Create new promo
    const newPromo = new Promo({
      name,
      discount : discountRate,
      category,
      description,
      images: imageLinks,
    });

    await newPromo.save();

    const liq = await Liquor.find({ category: category });

    if (liq.length > 0) {
    for (const liquor of liq) {
        const promoPricing = liquor.price - (liquor.price * (newPromo.discount / 100));
        liquor.promoPrice = promoPricing;
        await liquor.save();
    }
    }

    // Optional: Notify users
    const Users = await User.find({ isAdmin: false });
    const tokens = Users.map(user => user.FCMtoken).filter(token => !!token);

    if (tokens.length > 0) {
      try {
        await sendPushNotification(
          tokens,
          `New Promo: ${newPromo.name}\n${newPromo.description}\nGet ${newPromo.discount} % off! Enjoy your favorite ${newPromo.category} at a discounted price!`,
         
          `ULTRA ${newPromo.name} MEGA SALE!!!`,
        );
      } catch (notifError) {
        console.error("Error sending notification:", notifError.message);
      }
    }

    res.status(201).json({
      success: true,
      data: newPromo,
    });
  } catch (error) {
    console.error("Error in Creating Promo:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }

};


export const getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find({});
    res.status(200).json({
      success: true,
      data: promos,
    });
  } catch (error) {
    console.error("Error fetching promos:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deletePromo = async (req, res) => {
    const { id } = req.params;
    console.log("Deleting promo with ID:", id);
    try {
      const promo = await Promo.findById(id);
      if (!promo) {
        return res.status(404).json({
          success: false,
          message: "Promo not found",
        });
      }
  
      // Delete images from Cloudinary
      for (let image of promo.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
  
      const liquor = await Liquor.find({ category: promo.category });
      if (liquor.length > 0) {
        for (const liquorItem of liquor) {
          liquorItem.promoPrice = null; // Reset promo price
          await liquorItem.save();
        }
      }
  
      // Use deleteOne instead of remove
      await promo.deleteOne();
  
      res.status(200).json({
        success: true,
        message: "Promo deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting promo:", error.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
  