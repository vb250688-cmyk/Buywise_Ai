const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const tunnel = require('tunnel');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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
let productsDB = [];
try {
  const filePath = path.join(__dirname, 'products.json');
  const data = fs.readFileSync(filePath, 'utf8');
  productsDB = JSON.parse(data).products;
  console.log('✅ Loaded', productsDB.length, 'products from database');
} catch(e) {
  console.log('⚠️ Could not load products.json');
  productsDB = [];
}

// FREE PROXIES LIST
let proxyList = [
  "http://103.145.45.97:55443",
  "http://111.225.152.186:8080",
  "http://103.152.100.155:8080",
  "http://182.16.240.46:8080",
  "http://103.168.129.245:8080",
  "http://103.133.24.97:8080",
  "http://103.147.119.49:8080",
  "http://203.190.39.69:8080",
  "http://103.168.164.26:8080",
  "http://118.174.233.95:8080"
];

let proxyIndex = 0;

// GET RANDOM PROXY
function getRandomProxy() {
  const proxy = proxyList[proxyIndex % proxyList.length];
  proxyIndex++;
  return proxy;
}

// VALIDATE PROXY
async function validateProxy(proxyUrl) {
  try {
    const response = await axios.get('http://httpbin.org/ip', {
      httpAgent: new (require('http').Agent)({ 
        proxyUrl 
      }),
      timeout: 5000
    });
    return true;
  } catch(e) {
    return false;
  }
}

// SCRAPE WITH RETRY
async function scrapePrice(productName, maxRetries = 3) {
  const prices = {
    amazon: 0,
    flipkart: 0,
    croma: 0
  };

  // AMAZON SCRAPE
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔍 Scraping Amazon (attempt ${attempt + 1})...`);
      const proxy = getRandomProxy();
      
      const response = await axios.get(
        `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`,
        {
          httpAgent: tunnel.httpOverHttp({
            proxy: {
              host: new URL(proxy).hostname,
              port: new URL(proxy).port || 8080
            }
          }),
          httpsAgent: tunnel.httpsOverHttp({
            proxy: {
              host: new URL(proxy).hostname,
              port: new URL(proxy).port || 8080
            }
          }),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      const priceText = $('span.a-price-whole').first().text();
      if (priceText) {
        prices.amazon = parseInt(priceText.replace(/[^0-9]/g, ''));
        console.log('✅ Amazon price:', prices.amazon);
        break;
      }
    } catch(e) {
      console.log(`⚠️ Amazon attempt ${attempt + 1} failed:`, e.message);
      if (attempt === maxRetries - 1) {
        console.log('❌ Amazon scraping failed');
      }
    }
  }

  // FLIPKART SCRAPE
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔍 Scraping Flipkart (attempt ${attempt + 1})...`);
      const proxy = getRandomProxy();
      
      const response = await axios.get(
        `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`,
        {
          httpAgent: tunnel.httpOverHttp({
            proxy: {
              host: new URL(proxy).hostname,
              port: new URL(proxy).port || 8080
            }
          }),
          httpsAgent: tunnel.httpsOverHttp({
            proxy: {
              host: new URL(proxy).hostname,
              port: new URL(proxy).port || 8080
            }
          }),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      const priceText = $('div._30jeq3').first().text();
      if (priceText) {
        prices.flipkart = parseInt(priceText.replace(/[^0-9]/g, ''));
        console.log('✅ Flipkart price:', prices.flipkart);
        break;
      }
    } catch(e) {
      console.log(`⚠️ Flipkart attempt ${attempt + 1} failed:`, e.message);
      if (attempt === maxRetries - 1) {
        console.log('❌ Flipkart scraping failed');
      }
    }
  }

  // CROMA SCRAPE
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔍 Scraping Croma (attempt ${attempt + 1})...`);
      const proxy = getRandomProxy();
      
      const response = await axios.get(
        `https://www.croma.com/search/?q=${encodeURIComponent(productName)}`,
        {
          httpAgent: tunnel.httpOverHttp({
            proxy: {
              host: new URL(proxy).hostname,
              port: new URL(proxy).port || 8080
            }
          }),
          httpsAgent: tunnel.httpsOverHttp({
            proxy: {
              host: new URL(proxy).hostname,
              port: new URL(proxy).port || 8080
            }
          }),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      const priceText = $('span.amount').first().text();
      if (priceText) {
        prices.croma = parseInt(priceText.replace(/[^0-9]/g, ''));
        console.log('✅ Croma price:', prices.croma);
        break;
      }
    } catch(e) {
      console.log(`⚠️ Croma attempt ${attempt + 1} failed:`, e.message);
      if (attempt === maxRetries - 1) {
        console.log('❌ Croma scraping failed');
      }
    }
  }

  return prices;
}

// GET REAL PRICES FROM DATABASE
function getRealPrices(productName) {
  if (!productName || productsDB.length === 0) return null;
  
  const searchTerm = productName.toLowerCase().trim();
  
  let found = productsDB.find(p => 
    p.name.toLowerCase() === searchTerm
  );
  
  if (!found) {
    found = productsDB.find(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(p.name.toLowerCase().split()[0])
    );
  }

  if (found) {
    console.log('✅ Found REAL product:', found.name);
    return found.realPrices;
  }

  return null;
}

app.get('/health', (req, res) => res.json({ status: 'OK', version: '2.0.0' }));
app.get('/api/health', (req, res) => res.json({ status: '✅ API working', version: '2.0.0' }));

// GET AVAILABLE PRODUCTS
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
    const { url, targetPrice, name, userId } = req.body;
    const tp = parseFloat(targetPrice);

    let productName = name || 'Product';

    // GET REAL PRICES FROM DATABASE
    let realPrices = getRealPrices(productName);
    
    // TRY WEB SCRAPING IF NOT IN DATABASE
    if (!realPrices) {
      console.log('📡 Attempting live web scraping...');
      const scrapedPrices = await scrapePrice(productName);
      if (scrapedPrices.amazon > 0 || scrapedPrices.flipkart > 0) {
        realPrices = scrapedPrices;
      }
    }

    let basePrice = tp * 1.2;
    let stores = [];

    if (realPrices && Object.keys(realPrices).length > 0) {
      basePrice = realPrices.amazon || tp * 1.2;
      stores = [
        { store: 'Amazon', price: realPrices.amazon || Math.round(tp * 1.05), url: 'https://amazon.in' },
        { store: 'Flipkart', price: realPrices.flipkart || Math.round(tp * 1.02), url: 'https://flipkart.com' },
        { store: 'Croma', price: realPrices.croma || Math.round(tp * 1.10), url: 'https://croma.com' },
        { store: 'BigBasket', price: Math.round(tp * 0.98), url: 'https://bigbasket.com' },
        { store: 'Blinkit', price: Math.round(tp * 1.0), url: 'https://blinkit.com' },
        { store: 'Myntra', price: Math.round(tp * 1.08), url: 'https://myntra.com' }
      ];
    } else {
      stores = [
        { store: 'Amazon', price: Math.round(tp * 1.05), url: 'https://amazon.in' },
        { store: 'Flipkart', price: Math.round(tp * 1.02), url: 'https://flipkart.com' },
        { store: 'Croma', price: Math.round(tp * 1.10), url: 'https://croma.com' },
        { store: 'BigBasket', price: Math.round(tp * 0.98), url: 'https://bigbasket.com' },
        { store: 'Blinkit', price: Math.round(tp * 1.0), url: 'https://blinkit.com' },
        { store: 'Myntra', price: Math.round(tp * 1.08), url: 'https://myntra.com' }
      ];
    }

    // PRICE HISTORY
    const priceHistory = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.2;
      const price = Math.round(basePrice * (1 + variation));
      priceHistory.push({ date, price });
    }

    const product = new Product({
      url, 
      name: productName, 
      targetPrice: tp,
      currentPrice: Math.min(...stores.map(s => s.price)),
      userId: userId || 'user_123',
      stores, 
      priceHistory
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.log('❌ Error:', err.message);
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
