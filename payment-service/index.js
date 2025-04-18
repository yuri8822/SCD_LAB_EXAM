const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// I will be simulating the payment processing
app.post('/payments', async (req, res) => {
  const { orderId, amount } = req.body;
  try {
    // Verifying order total
    const orderRes = await axios.get(`http://order-service:3002/orders/${orderId}`);
    if (!orderRes.data || orderRes.data.total !== amount) {
      return res.status(400).json({ error: 'Invalid order or amount' });
    }

    // Simulating payment gateway integration
    const paymentStatus = 'success';
    if (paymentStatus !== 'success') {
      return res.status(400).json({ error: 'Payment failed' });
    }

    res.json({ message: 'Payment processed', orderId, amount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await axios.get(`http://order-service:3002/orders/${req.params.id}`);
    res.json(order.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.listen(3005, () => {
  console.log('Payment Service running on port 3005');
});