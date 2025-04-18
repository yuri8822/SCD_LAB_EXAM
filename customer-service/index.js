const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/cafe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Customer Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const CustomerSchema = new mongoose.Schema({
  id: String,
  email: String,
  points: Number
});
const Customer = mongoose.model('Customer', CustomerSchema);

// Seed initial data
const seedData = async () => {
  const count = await Customer.countDocuments();
  if (count === 0) {
    await Customer.create({ id: 'emma123', email: 'emma@example.com', points: 10 });
    console.log('Customer seeded with initial data');
  }
};
seedData();

app.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update loyalty points
app.post('/customers/update-points', async (req, res) => {
  const { customerId, points } = req.body;
  try {
    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customer.points += points;
    await customer.save();
    res.json({ message: 'Points updated', points: customer.points });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update points' });
  }
});

app.listen(3004, () => {
  console.log('Customer Service running on port 3004');
});