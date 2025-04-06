import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Liquor from "../models/liquorModel.js"; 

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({});
    res.status(200).json({ success: true, data: reviews, count: reviews.length });
  } catch (error) {
    console.log("Error in Fetching Reviews: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a single review by ID
export const getReview = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.log("Error in Fetching Review: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { rating, comment, user, liquor, order } = req.body;
    if (!rating || !comment || !user || !liquor || !order) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingReview = await Review.findOne({ user, liquor, order });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists. Please update your existing review."
      });
    }

    const review = await Review.create({
      rating,
      comment,
      user,
      liquor,
      order,
    });

    // Optionally, update the liquor document to add the review's ID
    await Liquor.findByIdAndUpdate(liquor, { $push: { reviews: review._id } });
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.log("Error creating review:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update an existing review
export const updateReview = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    // Update allowed fields: rating and comment (you can extend this as needed)
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: updatedReview });
  } catch (error) {
    console.log("Error updating review:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No Review with id: ${id}`);
  try {
    await Review.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error Deleting Review: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
