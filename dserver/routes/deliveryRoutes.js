const express = require('express');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const router = express.Router();

// Add to bucket
router.post('/bucket/:orderId/add', async (req, res) => {
  try {
    const { riderId } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.inBucket) return res.status(400).json({ error: 'Already in bucket' });

    // update order
    order.inBucket = true;
    await order.save();

    // add to rider bucket list
    await Rider.findByIdAndUpdate(
      riderId,
      { $addToSet: { bucketList: { order: order._id } } },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.error('Add bucket error:', err);
    res.status(500).json({ error: 'Failed to add to bucket' });
  }
});

// Remove from bucket
router.post('/bucket/:orderId/remove', async (req, res) => {
  try {
    const { riderId } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Not found' });

    // update order
    order.inBucket = false;
    await order.save();

    // remove from rider bucket list
    await Rider.findByIdAndUpdate(
      riderId,
      { $pull: { bucketList: { order: order._id } } }
    );

    res.json(order);
  } catch (err) {
    console.error('Remove bucket error:', err);
    res.status(500).json({ error: 'Failed to remove from bucket' });
  }
});

module.exports = router;
