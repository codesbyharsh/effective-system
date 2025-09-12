// routes/deliveryRoutes.js
const express = require('express');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const router = express.Router();

// ✅ Add to bucket (assign order to rider)
router.post('/bucket/:orderId/add', async (req, res) => {
  try {
    const { riderId } = req.body;
    if (!riderId) return res.status(400).json({ error: 'riderId required' });

    const [order, rider] = await Promise.all([
      Order.findById(req.params.orderId),
      Rider.findById(riderId)
    ]);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    // Already assigned to same rider
    if (order.inBucket && order.assignedTo?.riderId?.toString() === riderId) {
      return res.status(400).json({ error: 'Order is already in your bucket' });
    }

    // Assigned to someone else
    if (order.inBucket && order.assignedTo?.riderId?.toString() !== riderId) {
      return res.status(400).json({ error: 'Order already assigned to another rider' });
    }

    // Assign fresh
    order.inBucket = true;
    order.assignedTo = {
      riderId: rider._id,
      riderName: rider.name || rider.username,
      assignedAt: new Date(),
      deliveredAt: null,
      completed: false
    };
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Add bucket error:", err);
    res.status(500).json({ error: 'Failed to add to bucket' });
  }
});

// ✅ Remove from bucket (unassign)
router.post('/bucket/:orderId/remove', async (req, res) => {
  try {
    const { riderId } = req.body;
    if (!riderId) return res.status(400).json({ error: 'riderId required' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!order.inBucket || !order.assignedTo?.riderId) {
      return res.status(400).json({ error: 'Order is not assigned' });
    }

    if (order.assignedTo.riderId.toString() !== riderId) {
      return res.status(400).json({ error: 'You cannot remove this order. It belongs to another rider.' });
    }

    // Unassign
    order.inBucket = false;
    order.assignedTo = {
      riderId: null,
      riderName: null,
      assignedAt: null,
      deliveredAt: null,
      completed: false
    };
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Remove bucket error:", err);
    res.status(500).json({ error: 'Failed to remove from bucket' });
  }
});

module.exports = router;
