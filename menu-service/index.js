const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/cafe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Menu Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Item Schema
const ItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  stock: Number
});
const Item = mongoose.model('Item', ItemSchema);

// Seed initial data
const seedData = async () => {
  const count = await Item.countDocuments();
  if (count === 0) {
    await Item.insertMany([
      { id: 'latte', name: 'latte', price: 4.0, stock: 100 },
      { id: 'muffin', name: 'blueberry muffin', price: 3.0, stock: 50 }
    ]);
    console.log('Menu seeded with initial data');
  }
};
seedData();

// GET menu (only in-stock items)
app.get('/menu', async (req, res) => {
  try {
    const items = await Item.find({ stock: { $gt: 0 } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Validate item availability (for Order Service)
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ id: req.params.id });
    if (!item || item.stock <= 0) {
      return res.status(400).json({ error: 'Item not available' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate item' });
  }
});

app.listen(3001, () => {
  console.log('Menu Service running on port 3001');
});