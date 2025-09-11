const express = require('express');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const router = express.Router();

// Add to bucket
router.post('/bucket/:orderId/add', async (req, res) => {
  try {
    const { riderId } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Case 1: Already in THIS rider's bucket
    if (order.inBucket && order.bucketedBy?.toString() === riderId) {
      return res.status(400).json({ error: 'Order is already in your bucket' });
    }

    // Case 2: Already in ANOTHER rider's bucket
    if (order.inBucket && order.bucketedBy?.toString() !== riderId) {
      return res.status(400).json({ error: 'Order is already assigned to another rider' });
    }

    // Case 3: Free order → assign to rider
    order.inBucket = true;
    order.bucketedBy = riderId;
    await order.save();

    await Rider.findByIdAndUpdate(riderId, { $addToSet: { bucketList: order._id } });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Add bucket error:", err);
    res.status(500).json({ error: 'Failed to add to bucket' });
  }
});

// Remove order from rider's bucket
router.post('/bucket/:orderId/remove', async (req, res) => {
  try {
    const { riderId } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only allow the rider who bucketed it to remove
    if (order.bucketedBy?.toString() !== riderId) {
      return res.status(400).json({ error: 'You cannot remove this order. It belongs to another rider.' });
    }

    order.inBucket = false;
    order.bucketedBy = null;
    await order.save();

    await Rider.findByIdAndUpdate(riderId, { $pull: { bucketList: order._id } });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Remove bucket error:", err);
    res.status(500).json({ error: 'Failed to remove from bucket' });
  }
});

module.exports = router;
