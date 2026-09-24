const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    title: String,
    coverImage: String,
    price: Number,
    quantity: { type: Number, required: true },
    // Each seller fulfills only the line items that belong to them, so
    // fulfillment status is tracked per item, independent of the order's
    // overall (customer-facing) status.
    fulfillmentStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
      default: 'Pending'
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD'],
      default: 'COD'
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    // Captured when a user cancels their own order, so sellers/admins can see
    // why (spec extension: cancellation flow asks the customer for a reason).
    cancelReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
