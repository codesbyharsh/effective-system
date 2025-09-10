const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  bucketList: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      status: {
        type: String,
        enum: ['pending', 'completed', 'incomplete'],
        default: 'pending'
      },
      addedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);
