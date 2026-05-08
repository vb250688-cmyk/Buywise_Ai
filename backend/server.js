const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

const productSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, default: 'Product' },
  currentPrice: { type: Number, default: 0 },
  targetPrice: { type: Number, default: 0 },
  userId: { type: String, default: 'user_123' },
  stores: [{ store: String, price: Number, url: String }],
  priceHistory: [{ date: { type: Date, default: Date.now }, price: Number }],
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

app.get('/health', (req, res) => res.json({ status: 'OK', version: '2.0.0' }));
app.get('/api/health', (req, res) => res.json({ status: '✅ API working', version: '2.0.0' }));

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { url, targetPrice, userId } = req.body;

    let name = 'Product';
    if (url.includes('amazon')) name = 'Amazon Product';
    else if (url.includes('flipkart')) name = 'Flipkart Product';
    else if (url.includes('croma')) name = 'Croma Product';
    else if (url.includes('bigbasket')) name = 'BigBasket Product';
    else if (url.includes('blinkit')) name = 'Blinkit Product';
    else if (url.includes('myntra')) name = 'Myntra Product';

    const priceHistory = [];
    const basePrice = parseFloat(targetPrice) * 1.2;
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      priceHistory.push({
        date,
        price: Math.round(basePrice + (Math.random() - 0.5) * 0.2 * basePrice)
      });
    }

    const tp = parseFloat(targetPrice);
    const stores = [
      { store: 'Amazon', price: Math.round(tp * 1.1), url: 'https://amazon.in' },
      { store: 'Flipkart', price: Math.round(tp * 1.05), url: 'https://flipkart.com' },
      { store: 'Croma', price: Math.round(tp * 1.15), url: 'https://croma.com' },
      { store: 'BigBasket', price: Math.round(tp * 0.95), url: 'https://bigbasket.com' },
      { store: 'Blinkit', price: Math.round(tp * 1.0), url: 'https://blinkit.com' },
      { store: 'Myntra', price: Math.round(tp * 1.08), url: 'https://myntra.com' }
    ];

    const product = new Product({
      url, name, targetPrice: tp,
      currentPrice: Math.min(...stores.map(s => s.price)),
      userId: userId || 'user_123',
      stores, priceHistory
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price-history/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    const chartData = product.priceHistory.map(h => ({
      date: h.date.toISOString().split('T')[0], price: h.price
    }));
    res.json({ success: true, chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/compare/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, stores: product.stores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
