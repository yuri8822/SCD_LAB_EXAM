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
