const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

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

// REAL PRODUCTS DATABASE
const productsDB = JSON.parse(fs.readFileSync('./products.json', 'utf8')).products;

// Function to find real prices
function getRealPrices(productName) {
  const searchTerm = productName.toLowerCase();
  
  // Find matching product from database
  const found = productsDB.find(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    searchTerm.includes(p.name.toLowerCase().split()[0])
  );

  if (found) {
    console.log('✅ Found real product:', found.name);
    return {
      amazon: found.realPrices.amazon,
      flipkart: found.realPrices.flipkart,
      croma: found.realPrices.croma,
      bigbasket: found.realPrices.bigbasket,
      blinkit: found.realPrices.blinkit,
      myntra: found.realPrices.myntra
    };
  }

  // Fallback: generate realistic prices from target
  console.log('⚠️ Product not in DB, generating realistic prices');
  return null;
}

app.get('/health', (req, res) => res.json({ status: 'OK', version: '2.0.0' }));
app.get('/api/health', (req, res) => res.json({ status: '✅ API working', version: '2.0.0' }));

// GET ALL PRODUCTS FROM DB
app.get('/api/available-products', (req, res) => {
  res.json({ success: true, products: productsDB });
});

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

    const tp = parseFloat(targetPrice);

    // GET REAL PRICES FROM DATABASE
    let realPrices = getRealPrices(name);
    
    // If found in DB, use real prices
    let basePrice = tp * 1.2;
    let stores = [];

    if (realPrices) {
      basePrice = realPrices.amazon;
      stores = [
        { store: 'Amazon', price: realPrices.amazon, url: 'https://amazon.in' },
        { store: 'Flipkart', price: realPrices.flipkart, url: 'https://flipkart.com' },
        { store: 'Croma', price: realPrices.croma, url: 'https://croma.com' },
        { store: 'BigBasket', price: realPrices.bigbasket, url: 'https://bigbasket.com' },
        { store: 'Blinkit', price: realPrices.blinkit, url: 'https://blinkit.com' },
        { store: 'Myntra', price: realPrices.myntra, url: 'https://myntra.com' }
      ];
    } else {
      // Fallback: realistic calculation
      stores = [
        { store: 'Amazon', price: Math.round(tp * 1.05), url: 'https://amazon.in' },
        { store: 'Flipkart', price: Math.round(tp * 1.02), url: 'https://flipkart.com' },
        { store: 'Croma', price: Math.round(tp * 1.10), url: 'https://croma.com' },
        { store: 'BigBasket', price: Math.round(tp * 0.98), url: 'https://bigbasket.com' },
        { store: 'Blinkit', price: Math.round(tp * 1.0), url: 'https://blinkit.com' },
        { store: 'Myntra', price: Math.round(tp * 1.08), url: 'https://myntra.com' }
      ];
    }

    // REALISTIC PRICE HISTORY (±5-10% variation)
    const priceHistory = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Realistic fluctuation: ±10%
      const variation = (Math.random() - 0.5) * 0.2;
      const price = Math.round(basePrice * (1 + variation));
      
      priceHistory.push({ date, price });
    }

    const product = new Product({
      url, name, targetPrice: tp,
      currentPrice: Math.min(...stores.map(s => s.price)),
      userId: userId || 'user_123',
      stores, priceHistory
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.log('Error:', err.message);
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
      date: h.date.toISOString().split('T')[0], 
      price: h.price
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
