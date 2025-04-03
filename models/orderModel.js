import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    orderItems: [
      {
        qty: { 
          type: Number, 
          required: true 
        },
        liquor: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Liquor",
        },
        // Optional: Capture snapshot details of the product at the time of order
        name: { type: String },
        price: { type: Number },
      },
    ],
    // Optional: More detailed shipping address
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: ['Cash on Delivery', 'GCash'],
        message: "Please select the correct payment method",
      },
    },
    proofOfPayment: {
      public_id: { type: String },
      url: { type: String },
    },
    // Payment status fields
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    deliveredAt: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
