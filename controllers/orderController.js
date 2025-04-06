import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Liquor from "../models/liquorModel.js";
import User from "../models/userModel.js";
import Review from "../models/reviewModel.js";
import cloudinary from "../utils/cloudinaryConfig.js";

// Get all orders
export const getOrders = async (req, res) => {
    try {
      // Fetch orders as plain JS objects
      const orders = await Order.find({}).lean();
      
      // Extract all order IDs from fetched orders
      const orderIds = orders.map(order => order._id);
      
      // Fetch all reviews for these orders
      const reviews = await Review.find({ order: { $in: orderIds } }).lean();
      
      // For each order, enrich each order item with its review (if one exists)
      const enrichedOrders = orders.map(order => {
        const updatedOrderItems = order.orderItems.map(item => {
          // Look for a review where both the liquor and order match
          const review = reviews.find(
            r =>
              r.liquor.toString() === item.liquor.toString() &&
              r.order.toString() === order._id.toString()
          );
          return { ...item, review: review || null };
        });
        return { ...order, orderItems: updatedOrderItems };
      });
      
      res.status(200).json({
        success: true,
        data: enrichedOrders,
        count: enrichedOrders.length,
      });
    } catch (error) {
      console.error("Error in Fetching Orders:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update an order
export const updateOrder = async (req, res) => {
    const { id } = req.params;

    // Validate order id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: `No Order with id: ${id}` });
    }

    try {
        // Update the order document with the request body data
        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        
        // Fetch the user who placed the order
        const userBuyer = await User.findById(updatedOrder.user._id);

        // Fetch liquor details for all liquors in the order
        const liquorDetails = await Liquor.find({
            _id: { $in: updatedOrder.orderItems.map(item => item.liquor) },
        });

        // Append liquor details to each order item
        const enrichedOrderItems = updatedOrder.orderItems.map(item => {
            const liquor = liquorDetails.find(l => l._id.equals(item.liquor));
            return {
                ...item.toObject(),
                liquorDetails: liquor ? liquor.toObject() : null,
            };
        });

        // Enrich the order with full liquor details and user's username
        const enrichedOrder = {
            ...updatedOrder.toObject(),
            orderItems: enrichedOrderItems,
            username: userBuyer.username,
        };

        // If the order status is updated to 'shipping', send an push notification
        if (req.body.status === "shipping") {
            try {
                // Push notification to the user
            } catch (notifError) {
                console.error("Error sending notification:", notifError.message);
            }
        }
        if (req.body.status === "completed") {
            try {
                // Push notification to the user
            } catch (notifError) {
                console.error("Error sending notification:", notifError.message);
            }
        }

        // Send a push notification to the user
        // await sendNotification(FCMToken, `Order Status: ${req.body.status}`, "");

        res.status(200).json({ success: true, data: enrichedOrder });
    } catch (error) {
        console.error("Error Updating Order:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createOrder = async (req, res) => {
    try {
    //   console.log("Create Order Logs", req.body);
      if (!req.body.orderItems) {
        return res.status(400).json({ success: false, message: "Order items not provided" });
      }
      
      // Parse and transform orderItems
      let orderItems = JSON.parse(req.body.orderItems);
      orderItems = orderItems.map(item => ({
        qty: item.quantity,          // Map quantity to qty
        liquor: item.productId,        // Map productId to liquor
        name: item.name,
        price: item.price
      }));
      
      // Parse the shipping address from a JSON string
      const shippingAddress = JSON.parse(req.body.shippingAddress);
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
        return res.status(400).json({ success: false, message: "Shipping address is incomplete" });
      }
      
      const paymentMethod = req.body.paymentMethod;
      const shippingPrice = Number(req.body.shippingPrice);
      const totalPrice = Number(req.body.totalPrice);
      
      // Process proofOfPayment file if provided
      let proofOfPayment = undefined;
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "order_proofs" },
            (error, result) => {
              if (error) {
                reject(new Error("Error uploading proof image to Cloudinary"));
              } else {
                resolve(result);
              }
            }
          );
          stream.end(req.file.buffer);
        });
        proofOfPayment = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
      
      const userId = req.body.userId || null;
      
      const order = await Order.create({
        orderItems,
        shippingAddress,
        paymentMethod,
        proofOfPayment,
        shippingPrice,
        totalPrice,
        user: userId,
      });
      
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  
