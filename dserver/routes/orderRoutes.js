// routes/orderRoutes.js
const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// get orders by pincode (only Packed / Processing)
router.get('/available/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const orders = await Order.find({
      'shippingAddress.pincode': pincode,
      orderStatus: 'Packed / Processing'
    })
      .populate('user', 'name mobile')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching available orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update delivery status
router.post('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.orderStatus = status;
    if (status === 'Packed / Processing') order.packedAt = new Date();
    if (status === 'Shipped / Dispatched') order.shippedAt = new Date();
    if (status === 'Out for Delivery') order.outForDeliveryAt = new Date();
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.inBucket = false;

      // Mark assignedTo as completed/delivered if assigned
      if (order.assignedTo && order.assignedTo.riderId) {
        order.assignedTo.deliveredAt = new Date();
        order.assignedTo.completed = true;
      }
    }
    if (status === 'Cancelled') {
      order.inBucket = false;

      // If assigned, mark incomplete
      if (order.assignedTo && order.assignedTo.riderId) {
        order.assignedTo.completed = false;
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Return flow
router.post('/:orderId/return', async (req, res) => {
  try {
    const { returnStatus } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.returnStatus = returnStatus;
    const now = new Date();
    if (returnStatus === 'Return Requested') order.returnTimeline.requestedAt = now;
    if (returnStatus === 'Return Approved / Pickup Scheduled') order.returnTimeline.approvedAt = now;
    if (returnStatus === 'Return Picked Up') order.returnTimeline.pickedUpAt = now;
    if (returnStatus === 'Return in Transit') order.returnTimeline.inTransitAt = now;
    if (returnStatus === 'Return Completed') order.returnTimeline.completedAt = now;
    if (returnStatus === 'Refund Initiated') order.returnTimeline.refundInitiatedAt = now;
    if (returnStatus === 'Refund Completed') order.returnTimeline.refundCompletedAt = now;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Return update error:', err);
    res.status(500).json({ error: 'Failed to update return status' });
  }
});

module.exports = router;
