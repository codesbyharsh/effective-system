// server/models/RiderLocation.js
const mongoose = require('mongoose');

const riderLocationSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // unique -> a single current location
  name: { type: String }, // optional rider name for display
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, required: true }, // store Date
}, { timestamps: true });

// create unique index on username to ensure only one entry exists per rider
riderLocationSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('RiderLocation', riderLocationSchema);
