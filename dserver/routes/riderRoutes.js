// routes/riderRoutes.js
const express = require("express");
const RiderLocation = require("../models/RiderLocation"); // if you have a model for location
const Rider = require("../models/Rider");
const router = express.Router();


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const rider = await Rider.findOne({ username, password });
    if (!rider) return res.status(401).json({ error: "Invalid credentials" });

    // return only safe fields
    res.json({
      _id: rider._id,
      username: rider.username,
      name: rider.name
    });
  } catch (err) {
    console.error("Rider login failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Update rider location
router.post("/:id/location", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const riderId = req.params.id;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat/lng required" });
    }

    // save/update last location (upsert style)
    await RiderLocation.findOneAndUpdate(
      { rider: riderId },
      { coords: { lat, lng }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(
      `📍 Rider ${riderId} shared location: ${lat}, ${lng} at ${new Date().toISOString()}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Location update error:", err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Get latest location for a rider
router.get("/:id/location", async (req, res) => {
  try {
    const riderId = req.params.id;
    const loc = await RiderLocation.findOne({ rider: riderId });
    if (!loc) return res.json({ success: true, location: null });

    res.json({
      success: true,
      location: {
        lat: loc.coords.lat,
        lng: loc.coords.lng,
        updatedAt: loc.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get location error:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});


module.exports = router;
