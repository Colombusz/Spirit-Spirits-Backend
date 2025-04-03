import mongoose from "mongoose";
import Order from "../models/order.js";
import Liquor from "../models/liquor.js";
import User from "../models/user.js";

// Get all orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length,
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
