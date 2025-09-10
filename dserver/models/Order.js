// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true }
  }],
  shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true },
  paymentMethod: { type: String, enum: ['COD', 'UPI'], required: true },
  totalAmount: { type: Number, required: true },

  orderStatus: {
    type: String,
    enum: [
      'Order Placed',
      'Packed / Processing',
      'Shipped / Dispatched',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Order Placed'
  },

  inBucket: {
  type: Boolean,
  default: false
},

  placedAt: { type: Date, default: Date.now },
  packedAt: Date,
  shippedAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
