const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/cafe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Inventory Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const StockSchema = new mongoose.Schema({
  itemId: String,
  stock: Number
});
const Stock = mongoose.model('Stock', StockSchema);

// Seed initial data
const seedData = async () => {
  const count = await Stock.countDocuments();
  if (count === 0) {
    await Stock.insertMany([
      { itemId: 'latte', stock: 100 },
      { itemId: 'muffin', stock: 50 }
    ]);
    console.log('Inventory seeded with initial data');
  }
};
seedData();

app.post('/inventory/update', async (req, res) => {
  const { items } = req.body;
  try {
    for (const [itemId, quantity] of Object.entries(items)) {
      const stock = await Stock.findOne({ itemId });
      if (!stock || stock.stock < quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${itemId}` });
      }
      stock.stock -= quantity;
      await stock.save();
    }
    res.json({ message: 'Stock updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

app.listen(3003, () => {
  console.log('Inventory Service running on port 3003');
});