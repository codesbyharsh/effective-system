// routes/rider.js
const express = require("express");
const RiderLocation = require("../models/RiderLocation");
const Rider = require("../models/Rider");

const router = express.Router();

// Save or update rider location
router.post("/location", async (req, res) => {
  try {
    const { username, name, latitude, longitude, timestamp } = req.body;
    if (!username || typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const location = await RiderLocation.findOneAndUpdate(
      { username },
      { username, name, latitude, longitude, timestamp: timestamp ? new Date(timestamp) : new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // update rider metadata (optional)
    await Rider.findOneAndUpdate({ username }, { lastOnlineAt: new Date() });

    res.json({ success: true, data: location });
  } catch (err) {
    console.error("Error saving rider location:", err);
    res.status(500).json({ error: "Failed to save location" });
  }
});

module.exports = router;
