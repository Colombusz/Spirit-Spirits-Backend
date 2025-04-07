import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Liquor from "../models/liquorModel.js";
import User from "../models/userModel.js";
import Review from "../models/reviewModel.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import {sendPushNotification} from "./NotifMessageHandler.js";
// Get all orders
export const getOrders = async (req, res) => {
  try {
    // Fetch orders and populate the user field with selected details (e.g., username, email, firstname, lastname)
    const orders = await Order.find({})
      .populate('user', 'username firstname lastname email')
      .lean();
    
    // Extract all order IDs from fetched orders
    const orderIds = orders.map(order => order._id);
    
    // Fetch all reviews for these orders
    const reviews = await Review.find({ order: { $in: orderIds } }).lean();
    
    // Enrich order items with their reviews if they exist
    const enrichedOrders = orders.map(order => {
      const updatedOrderItems = order.orderItems.map(item => {
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
// Update an order
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  console.log("Update Order Logs", req.body);

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
    console.log("User Buyer Logs", userBuyer);







    // Get admins and their FCM tokens
    const admins = await User.find({ isAdmin: true });
    const fcmTokens = admins.map(admin => admin.FCMtoken);


    // Prepare the message to send to the user
    let userMessage = getUserMessage(req.body.status, userBuyer.firstname, id);
    let adminMessage = getAdminMessage(req.body.status, userBuyer._id, id);






    // Send push notifications to admins if necessary
    if (fcmTokens.length > 0) {
      try {
        await sendPushNotification(fcmTokens, adminMessage, "Shop Order Status Update");
      } catch (notifError) {
        console.error("Error sending notification to admins:", notifError.message);
      }
    }

    // Send push notification to the user
    if (userBuyer.FCMtoken) {
      try {
        await sendPushNotification(userBuyer.FCMtoken, userMessage, "Order Status Update");
      } catch (notifError) {
        console.error("Error sending notification to user:", notifError.message);
      }
    } else {
      console.warn(`User ${userBuyer} does not have an FCM token.`);
    }






    // Fetch liquor details for all liquors in the order
    const liquorDetails = await Liquor.find({
      _id: { $in: updatedOrder.orderItems.map(item => item.liquor) },
    });

    // Enrich the order items with liquor details
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

    res.status(200).json({ success: true, data: enrichedOrder });
  } catch (error) {
    console.error("Error Updating Order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Function to construct the user notification message
function getUserMessage(status, firstname, orderId) {
  switch (status) {
    case 'Delivered':
      return `
        Good Day! ${firstname},
        Your Order with the ID: ${orderId} has been successfully Delivered!!
        Order Status: Delivered
        We hope you enjoy your purchase! Thank you for shopping with us.
      `;
    case 'Cancelled':
      return `
        Good Day! ${firstname},
        Your Order with the ID: ${orderId} has been Cancelled.
        Order Status: Cancelled
        We're sorry for the inconvenience. Please contact support if you need any assistance.
      `;
    case 'Processing':
    case 'Shipped':
      return `
        Good Day! ${firstname},
        Your Order with the ID: ${orderId} has been ${status}.
        Order Status: ${status}
      `;
    case 'Pending':
      return `
        Good Day! ${firstname},
        Your Order with the ID: ${orderId} is pending.
        Order Status: Pending
      `;
    default:
      return `Order Status: ${status}`;
  }
}

// Function to construct the admin notification message
function getAdminMessage(status, userId, orderId) {
  switch (status) {
    case 'Delivered':
      return `
        Good Day! Admins, User ${userId} has completed their order with ID: ${orderId}.
      `;
    case 'Cancelled':
      return `
        Good Day! Admins, User ${userId} has cancelled their order with ID: ${orderId}.
      `;
    case 'Pending':
      return `
        Good Day! Admins, User ${userId} has placed an order with ID: ${orderId}.
      `;
  }
}


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
  
