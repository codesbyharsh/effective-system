// routes/pincodeRoutes.js
const express = require("express");
const Pincode = require("../models/Pincode");

const router = express.Router();

/**
 * Get all available pincodes
 * GET /api/pincodes
 */
router.get("/", async (req, res) => {
  try {
    const pincodes = await Pincode.find({ deliveryAvailable: true });
    res.json({ success: true, data: pincodes });
  } catch (err) {
    console.error("Error fetching pincodes:", err);
    res.status(500).json({ error: "Failed to fetch pincodes" });
  }
});

/**
 * Add new pincode (admin only ideally)
 * POST /api/pincodes
 */
router.post("/", async (req, res) => {
  try {
    const { pincode, city, taluka, district, state } = req.body;

    if (!pincode || !city || !taluka || !district || !state) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const exists = await Pincode.findOne({ pincode });
    if (exists) return res.status(400).json({ error: "Pincode already exists" });

    const newPincode = new Pincode({ pincode, city, taluka, district, state });
    await newPincode.save();

    res.json({ success: true, data: newPincode });
  } catch (err) {
    console.error("Error adding pincode:", err);
    res.status(500).json({ error: "Failed to add pincode" });
  }
});

module.exports = router;
