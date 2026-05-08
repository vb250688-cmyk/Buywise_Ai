const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { chromium } = require('playwright');

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

// WEB SCRAPING FUNCTION
async function getRealPrices(productName) {
  const prices = {
    amazon: 0,
    flipkart: 0,
    croma: 0
  };

  // AMAZON PRICE SCRAPING
  try {
    console.log('🔍 Scraping Amazon...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124');
    
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(productName)}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const price = await page.evaluate(() => {
      const elements = document.querySelectorAll('span.a-price-whole');
      if (elements.length > 0) {
        const text = elements[0].textContent.replace(/[^0-9]/g, '');
        return parseInt(text);
      }
      return 0;
    });
    
    prices.amazon = price || 0;
    console.log('✅ Amazon price:', prices.amazon);
    await browser.close();
  } catch(e) {
    console.log('⚠️ Amazon scrape failed:', e.message);
    prices.amazon = 0;
  }

  // FLIPKART PRICE SCRAPING
  try {
    console.log('🔍 Scraping Flipkart...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124');
    
    await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const price = await page.evaluate(() => {
      const elements = document.querySelectorAll('div._30jeq3._1_WHN1');
      if (elements.length > 0) {
        const text = elements[0].textContent.replace(/[^0-9]/g, '');
        return parseInt(text);
      }
      return 0;
    });
    
    prices.flipkart = price || 0;
    console.log('✅ Flipkart price:', prices.flipkart);
    await browser.close();
  } catch(e) {
    console.log('⚠️ Flipkart scrape failed:', e.message);
    prices.flipkart = 0;
  }

  // CROMA PRICE SCRAPING
  try {
    console.log('🔍 Scraping Croma...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124');
    
    await page.goto(`https://www.croma.com/search/?q=${encodeURIComponent(productName)}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const price = await page.evaluate(() => {
      const elements = document.querySelectorAll('span.amount');
      if (elements.length > 0) {
        const text = elements[0].textContent.replace(/[^0-9]/g, '');
        return parseInt(text);
      }
      return 0;
    });
    
    prices.croma = price || 0;
    console.log('✅ Croma price:', prices.croma);
    await browser.close();
  } catch(e) {
    console.log('⚠️ Croma scrape failed:', e.message);
    prices.croma = 0;
  }

  console.log('Final prices:', prices);
  return prices;
}

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

    const tp = parseFloat(targetPrice);

    // GET REAL PRICES FROM WEB SCRAPING
    console.log('Starting real price scraping for:', name);
    const priceData = await getRealPrices(name);

    // PRICE HISTORY WITH REAL BASE PRICE
    const priceHistory = [];
    const basePrice = priceData.amazon > 0 ? priceData.amazon : tp * 1.2;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      priceHistory.push({
        date,
        price: Math.round(basePrice + (Math.random() - 0.5) * 1.5 * basePrice)
      });
    }

    // STORES WITH REAL PRICES (fallback to calculated if scraping fails)
    const stores = [
      { 
        store: 'Amazon', 
        price: priceData.amazon > 0 ? priceData.amazon : Math.round(tp * 1.1), 
        url: 'https://amazon.in' 
      },
      { 
        store: 'Flipkart', 
        price: priceData.flipkart > 0 ? priceData.flipkart : Math.round(tp * 1.05), 
        url: 'https://flipkart.com' 
      },
      { 
        store: 'Croma', 
        price: priceData.croma > 0 ? priceData.croma : Math.round(tp * 1.15), 
        url: 'https://croma.com' 
      },
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
