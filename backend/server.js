const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: '✅ Backend running', version: '2.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: '✅ API working', version: '2.0.0' });
});

// Products endpoint
app.get('/api/products', (req, res) => {
  res.json({ success: true, products: [] });
});

app.post('/api/products', (req, res) => {
  res.json({ success: true, msg: 'Product added' });
});

app.get('/api/products/:id', (req, res) => {
  res.json({ success: true, product: {} });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
});
