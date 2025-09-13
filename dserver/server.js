require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ Register all models before using populate anywhere
require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Pincode');
require('./models/Rider');
require('./models/RiderLocation');

// Routes
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const riderRoutes = require('./routes/riderRoutes');
const pincodesRoutes = require('./routes/pincodesRoutes');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Use routes
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/pincodes', pincodesRoutes);

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Mongo error:', err));


  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT} `)
);
