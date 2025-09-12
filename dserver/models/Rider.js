// models/Rider.js
const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain for now (match your seeding)
  name: { type: String, required: true },
  phone: String,
  lastOnlineAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);
