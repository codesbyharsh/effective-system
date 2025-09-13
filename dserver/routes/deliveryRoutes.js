// dserver/routes/deliveryRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Rider = require('../models/Rider');

const router = express.Router();

/**
 * GET /api/delivery/bucket/:riderId
 * Returns currently assigned orders for a rider (inBucket && bucketedBy == riderId)
 */
router.get('/bucket/:riderId', async (req, res) => {
  try {
    const { riderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(riderId)) return res.status(400).json({ error: 'Invalid riderId' });

    const orders = await Order.find({ inBucket: true, bucketedBy: riderId })
      .populate('user', 'name mobile')
      .populate('items.product', 'name price')
      .sort({ assignedAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching rider bucket:', err);
    res.status(500).json({ error: 'Failed to fetch bucket' });
  }
});

/**
 * POST /api/delivery/bucket/:orderId/add
 * Atomic assign: if order is free OR already assigned to same rider, assign to rider.
 * Uses findOneAndUpdate filter to avoid race conditions.
 */
router.post('/bucket/:orderId/add', async (req, res) => {
  try {
    const { riderId } = req.body;
    const { orderId } = req.params;

    if (!riderId) return res.status(400).json({ error: 'riderId required' });
    if (!mongoose.Types.ObjectId.isValid(riderId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    // Try to atomically assign only if order is unassigned OR already assigned to same rider (idempotent)
    const filter = {
      _id: orderId,
      $or: [
        { inBucket: false },
        { bucketedBy: mongoose.Types.ObjectId(riderId) } // allow idempotent reassign
      ]
    };

    const update = {
      $set: {
        inBucket: true,
        bucketedBy: rider._id,
        bucketedByName: rider.name || rider.username
      },
      $push: {
        bucketHistory: {
          rider: rider._id,
          name: rider.name || rider.username,
          status: 'pending',
          assignedAt: new Date(),
          deliveredAt: null
        }
      }
    };

    const opts = { new: true };
    const updated = await Order.findOneAndUpdate(filter, update, opts)
      .populate('user', 'name mobile')
      .populate('items.product', 'name price');

    if (!updated) {
      // determine why: check current assignment
      const current = await Order.findById(orderId).select('inBucket bucketedBy bucketedByName');
      if (!current) return res.status(404).json({ error: 'Order not found' });
      if (current.inBucket && current.bucketedBy && current.bucketedBy.toString() !== riderId) {
        return res.status(400).json({ error: 'Order already assigned to another rider' });
      }
      // fallback generic
      return res.status(400).json({ error: 'Order could not be assigned' });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Add bucket error:', err);
    res.status(500).json({ error: 'Failed to add to bucket' });
  }
});

/**
 * POST /api/delivery/bucket/:orderId/remove
 * Only the rider who currently has the order may unassign it.
 * This marks inBucket false and leaves bucketHistory intact (we update latest entry status).
 */
router.post('/bucket/:orderId/remove', async (req, res) => {
  try {
    const { riderId } = req.body;
    const { orderId } = req.params;

    if (!riderId) return res.status(400).json({ error: 'riderId required' });
    if (!mongoose.Types.ObjectId.isValid(riderId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!order.inBucket || !order.bucketedBy) {
      return res.status(400).json({ error: 'Order is not assigned' });
    }

    if (order.bucketedBy.toString() !== riderId) {
      return res.status(400).json({ error: 'You cannot remove this order. It belongs to another rider.' });
    }

    // Update the latest bucketHistory entry for this rider -> mark incomplete (since removed)
    const lastIndex = [...order.bucketHistory].reverse().findIndex(h => h.rider?.toString() === riderId && h.status === 'pending');
    if (lastIndex !== -1) {
      // compute real index
      const idx = order.bucketHistory.length - 1 - lastIndex;
      order.bucketHistory[idx].status = 'incomplete';
      order.bucketHistory[idx].deliveredAt = null;
    }

    // Unassign
    order.inBucket = false;
    order.bucketedBy = null;
    order.bucketedByName = null;
    await order.save();

    // return updated order with useful populates
    const updated = await Order.findById(orderId)
      .populate('user', 'name mobile')
      .populate('items.product', 'name price');

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Remove bucket error:', err);
    res.status(500).json({ error: 'Failed to remove from bucket' });
  }
});

module.exports = router;
