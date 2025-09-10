const express = require('express');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const router = express.Router();

// get orders by pincode

// orderRoutes.js
// get orders by pincode
// Only show "Packed / Processing" orders for selected pincode
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

    res.json(orders); // client expects array
  } catch (err) {
    console.error('Error fetching available orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});




// update status
// update status
router.post('/:orderId/status', async (req, res) => {
  try {
    const { status, riderId } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.orderStatus = status;
    if (status === 'Packed / Processing') order.packedAt = new Date();
    if (status === 'Shipped / Dispatched') order.shippedAt = new Date();
    if (status === 'Out for Delivery') order.outForDeliveryAt = new Date();
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.inBucket = false;

      await Rider.updateOne(
        { 'bucketList.order': order._id },
        { $set: { 'bucketList.$.status': 'completed' } }
      );
    }
    if (status === 'Cancelled') {
      order.inBucket = false;

      await Rider.updateOne(
        { 'bucketList.order': order._id },
        { $set: { 'bucketList.$.status': 'incomplete' } }
      );
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});


module.exports = router;
