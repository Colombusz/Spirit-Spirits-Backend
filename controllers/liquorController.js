import mongoose from "mongoose";
import Liquor from "../models/liquorModel.js";
import User from "../models/userModel.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import { sendPushNotification } from "./NotifMessageHandler.js";
// Cloudinary upload function 
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

/* Aggregation pipeline for liquors: (FOR FILTERING AND SORTING)
   This example performs a lookup for reviews and calculates the average rating.
   Adjust the pipeline if you need additional lookups (e.g., orders).
*/
export const getLiquors = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build match object for filtering
    const matchStage = {};
    if (search) {
      matchStage.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      matchStage.category = category;
    }

    // Determine sort stage for price
    let sortStage = {};
    if (sort === 'asc') {
      sortStage.price = 1;
    } else if (sort === 'desc') {
      sortStage.price = -1;
    }

    const pipeline = [];
    // Apply filtering if any filters are present
    if (Object.keys(matchStage).length) {
      pipeline.push({ $match: matchStage });
    }
    
    // Lookup reviews if needed
    pipeline.push({
      $lookup: {
        from: "reviews", // the reviews collection
        localField: "_id",
        foreignField: "liquor",
        as: "reviews"
      }
    });
    
    // Add averageRating field
    pipeline.push({
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: "$reviews" }, 0] },
            then: { $avg: "$reviews.rating" },
            else: 0
          }
        }
      }
    });
    
    // Apply sorting if specified
    if (Object.keys(sortStage).length) {
      pipeline.push({ $sort: sortStage });
    }
    
    const liquors = await Liquor.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: liquors,
      count: liquors.length,
    });
  } catch (error) {
    console.error("Error in Fetching Liquors:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getLiquor = async (req, res) => {
  const { id } = req.params;
  try {
    // Populate reviews, and also populate the user field in each review
    const liquor = await Liquor.findById(id).populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name username' }, // include both name and username
    });
    res.status(200).json({ success: true, data: liquor });
  } catch (error) {
    console.error("Error in Fetching Liquor:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const createLiquor = async (req, res) => {
  try {
    // Destructure required fields for liquor
    const { name, price, description, brand, stock, category } = req.body;

    console.log("Creating Liquor with data:", req);
    console.log("Uploaded files:", req.files);

    // Validate required fields
    if (!name || !price || !description || !brand || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fields: name, price, description, brand, and category.",
      });
    }

    // Validate category against allowed values in the liquor model
    const validCategories = [
      'Vodka', 'Rum', 'Tequila', 'Whiskey', 'Gin', 'Brandy',
      'Liqueur', 'Beer', 'Wine', 'Champagne', 'Sake', 'Soju', 'Baijiu', 'Whisky', 'Other'
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Choose from Vodka, Rum, Tequila, Whiskey, Gin, Brandy, Liqueur, Beer, Wine, Champagne, Sake, Soju, Baijiu, Whisky, Other.",
      });
    }

    // Validate and upload images
    let imageLinks = [];
    if (req.files) {
      for (let file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer); // Upload to Cloudinary
          console.log("Cloudinary upload result:", result);
          imageLinks.push({ public_id: result.public_id, url: result.secure_url });
        } catch (error) {
          console.error("Cloudinary upload error:", error.message);
          return res.status(500).json({
            success: false,
            message: "Image upload failed. Please try again.",
          });
        }
      }
    }

    // Create new liquor
    const newLiquor = new Liquor({
      name,
      price,
      description,
      images: imageLinks,
      brand,
      stock,
      category,
      reviews: [],
      rating: 0,
      numReviews: 0,
    });

    await newLiquor.save();

    
    const Users = await User.find({isAdmin: false});
    const tokens = Users.map(user => user.FCMtoken).filter(token => !!token);

    if (tokens.length > 0) {
      try {
        await sendPushNotification(
          tokens, 
          `Check Out our new ${newLiquor.category}: ${newLiquor.name}
          ${newLiquor.description}
          For only ${newLiquor.price} pesos!!!
          `, 
          "New Liquor Alert!!!!");
      } catch (notifError) {
        console.error("Error sending notification to admins:", notifError.message);
      }
    }


    res.status(201).json({
      success: true,
      data: newLiquor,
    });
  } catch (error) {
    console.error("Error in Creating Liquor:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateLiquor = async (req, res) => {
  const { id } = req.params;
  console.log("Liquor to update:", req.body, id, req.files);

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No Liquor with id: ${id}`);

  try {
    const liquor = await Liquor.findById(id);
    if (!liquor) {
      return res.status(404).send(`No liquor found with id: ${id}`);
    }

    const images = req.files;  // Newly uploaded images (from `req.files`)
    const existingImages = req.body.existingImages || [];  // Existing images (from `req.body`)
    let imageLinks = [];  // Start with the existing images

    // If there are new images uploaded, process them
    if (images && images.length > 0) {
      // Upload the new images to Cloudinary
      for (let file of images) {
        const result = await uploadToCloudinary(file.buffer);
        imageLinks.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    // Identify images that are no longer in the new `existingImages` array
    


    // Delete the images from Cloudinary that are in the current set but not in the new set
    await Promise.all(
      liquor.images.map(async (image) => {  // Use map instead of forEach for async/await support
        if (!existingImages.includes(image.url)) {  // Check if the image URL is not in the existing list
          await cloudinary.uploader.destroy(image.public_id);  // Destroy the image from Cloudinary
        }
        else
        {
          imageLinks.push({ public_id: image.public_id, url: image.url });
        }
      })
    );
    

    // Prepare updated data, including images and other fields
    const updatedData = {
      name: req.body.name || liquor.name,
      price: req.body.price || liquor.price,
      description: req.body.description || liquor.description,
      brand: req.body.brand || liquor.brand,
      stock: req.body.stock || liquor.stock,
      category: req.body.category || liquor.category,
      images: imageLinks,  // Final image list (existing + new)
    };

    // Update the liquor document in the database
    const updatedLiquor = await Liquor.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ success: true, data: updatedLiquor });
  } catch (error) {
    console.error("Error Updating Liquor:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteLiquor = async (req, res) => {
  const { id } = req.params;

  // Check for valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No Liquor with id: ${id}`);
  }

  try {
    const liquor = await Liquor.findById(id);
    if (!liquor) {
      return res.status(404).json({ success: false, message: "Liquor not found" });
    }

    // Delete images from Cloudinary if they exist
    if (liquor.images && liquor.images.length > 0) {
      await Promise.all(
        liquor.images.map(async (image) => {
          await cloudinary.uploader.destroy(image.public_id);
        })
      );
    }

    // Delete the liquor document from the database
    await Liquor.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Liquor deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Liquor:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
