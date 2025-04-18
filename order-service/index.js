const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/cafe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Order Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const OrderSchema = new mongoose.Schema({
  customerId: String,
  items: Object,
  total: Number,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

app.post('/orders', async (req, res) => {
  const { customerId, items } = req.body;
  try {
    // Validate customer
    const customerRes = await axios.get(`http://customer-service:3004/customers/${customerId}`);
    if (!customerRes.data) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Validate items and calculate total
    let total = 0;
    for (const [itemId, quantity] of Object.entries(items)) {
      const itemRes = await axios.get(`http://menu-service:3001/items/${itemId}`);
      if (!itemRes.data) {
        return res.status(400).json({ error: `Item ${itemId} not available` });
      }
      total += itemRes.data.price * quantity;
    }

    // Store order
    const order = new Order({ customerId, items, total });
    await order.save();

    // Update inventory
    await axios.post('http://inventory-service:3003/inventory/update', { items });

    // Award loyalty points (1 point per $1 spent)
    const points = Math.floor(total);
    await axios.post('http://customer-service:3004/customers/update-points', { customerId, points });

    res.json({ orderId: order._id, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

app.listen(3002, () => {
  console.log('Order Service running on port 3002');
});