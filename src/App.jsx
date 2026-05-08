import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://buywise-ai-backend.onrender.com/api'

function PriceChart({ history }) {
  if (!history || history.length === 0) return null
  const prices = history.map(h => h.price)
  const max = Math.max(...prices)
  const min = Math.min(...prices)
  const range = max - min || 1
  const w = 600, h = 200, pad = 40

  const points = history.map((h, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2)
    const y = h + pad + ((max - h.price) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full border rounded-lg bg-blue-50">
        <polyline fill="rgba(37,99,235,0.1)" stroke="#2563eb" strokeWidth="2"
          points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`} />
        <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points} />
        <text x={pad} y={pad - 10} fontSize="11" fill="#666">₹{max}</text>
        <text x={pad} y={h - 10} fontSize="11" fill="#666">₹{min}</text>
        <text x={w / 2 - 40} y={h - 5} fontSize="11" fill="#666">30 Days</text>
      </svg>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [stores, setStores] = useState([])
  const [formData, setFormData] = useState({ url: '', targetPrice: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`)
      setProducts(res.data.products || [])
    } catch (err) { console.log(err) }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!formData.url || !formData.targetPrice) {
      setMessage('❌ URL aur Target Price daalo!')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API}/products`, {
        url: formData.url,
        targetPrice: parseFloat(formData.targetPrice),
        userId: 'user_123'
      })
      setMessage('✅ Product add ho gaya! Dashboard mein dekho.')
      setFormData({ url: '', targetPrice: '', name: '' })
      fetchProducts()
    } catch (err) {
      setMessage('❌ Error: ' + err.message)
    }
    setLoading(false)
  }

  const handleViewProduct = async (product) => {
    setSelectedProduct(product)
    setPage('detail')
    try {
      const [histRes, compRes] = await Promise.all([
        axios.get(`${API}/price-history/${product._id}`),
        axios.get(`${API}/compare/${product._id}`)
      ])
      setPriceHistory(histRes.data.chartData || [])
      setStores(compRes.data.stores || [])
    } catch (err) { console.log(err) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete karein?')) return
    try {
      await axios.delete(`${API}/products/${id}`)
      setMessage('✅ Deleted!')
      fetchProducts()
      if (page === 'detail') setPage('dashboard')
    } catch (err) { setMessage('❌ Error: ' + err.message) }
  }

  const bestStore = stores.length > 0 ? stores.reduce((a, b) => a.price < b.price ? a : b) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 onClick={() => setPage('home')} className="text-xl font-bold text-blue-600 cursor-pointer">💰 BuyWise AI v2.0</h1>
          <div className="flex gap-2">
            {[['home','🏠 Home'],['add','➕ Add'],['dashboard','📊 Dashboard']].map(([id, label]) => (
              <button key={id} onClick={() => setPage(id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${page === id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-xs underline">Close</button>
          </div>
        )}

        {/* HOME PAGE */}
        {page === 'home' && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-5xl font-bold text-white mb-3">Smart Price Tracker</h2>
              <p className="text-xl text-gray-200">6 stores ka price ek jagah track karo!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[['🔍','URL Paste Karo','Amazon, Flipkart etc ka link daalo'],
                ['📊','Price History','30 days ka chart dekho'],
                ['🔔','Best Deal','Sabse sasta store instantly jano']].map(([icon,title,desc]) => (
                <div key={title} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-4xl mb-3">{icon}</div>
                  <h3 className="text-lg font-bold mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Ab start karo!</h3>
              <p className="text-gray-500 mb-5">Koi bhi product ka URL paste karo aur turant price track karo</p>
              <button onClick={() => setPage('add')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700">
                🚀 Product Add Karo
              </button>
            </div>
          </div>
        )}

        {/* ADD PRODUCT */}
        {page === 'add' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">➕ Product Add Karo</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Product URL *</label>
                  <input type="url" placeholder="https://www.amazon.in/product..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Price (₹) *</label>
                  <input type="number" placeholder="Kitne mein kharidna chahte ho?"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.targetPrice} onChange={e => setFormData({...formData, targetPrice: e.target.value})} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? '⏳ Adding...' : '✨ Add & Track Karo'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">📊 Tumhare Products ({products.length})</h2>
              <button onClick={fetchProducts} className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold">🔄 Refresh</button>
            </div>
            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-gray-600 text-lg mb-4">Abhi koi product nahi hai</p>
                <button onClick={() => setPage('add')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                  ➕ Pehla Product Add Karo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                    <h3 className="font-bold text-lg mb-3 truncate">{p.name}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Current Price</p>
                        <p className="text-xl font-bold text-blue-600">₹{p.currentPrice}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Target Price</p>
                        <p className="text-xl font-bold text-green-600">₹{p.targetPrice}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewProduct(p)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
                        📊 Details
                      </button>
                      <button onClick={() => handleDelete(p._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-red-600">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCT DETAIL - CHART + COMPARISON */}
        {page === 'detail' && selectedProduct && (
          <div>
            <button onClick={() => setPage('dashboard')} className="mb-4 text-white flex items-center gap-2 hover:underline">
              ← Dashboard par wapis jao
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">{selectedProduct.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <p className="text-gray-500 text-sm">Current Best Price</p>
                <p className="text-3xl font-bold text-blue-600">₹{selectedProduct.currentPrice}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <p className="text-gray-500 text-sm">Tumhara Target</p>
                <p className="text-3xl font-bold text-green-600">₹{selectedProduct.targetPrice}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <p className="text-gray-500 text-sm">Bachoge</p>
                <p className={`text-3xl font-bold ${selectedProduct.currentPrice > selectedProduct.targetPrice ? 'text-red-500' : 'text-green-600'}`}>
                  ₹{Math.abs(selectedProduct.currentPrice - selectedProduct.targetPrice)}
                </p>
              </div>
            </div>

            {/* PRICE HISTORY CHART */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">📈 Price History (30 Days)</h3>
              {priceHistory.length > 0 ? (
                <PriceChart history={priceHistory} />
              ) : (
                <p className="text-gray-500 text-center py-8">Loading chart...</p>
              )}
            </div>

            {/* STORE COMPARISON */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">🏪 Sabhi Stores Ki Price</h3>
              {bestStore && (
                <div className="mb-4 p-3 bg-green-100 rounded-lg text-center">
                  <p className="text-green-800 font-bold">🏆 Best Deal: {bestStore.store} - ₹{bestStore.price}</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stores.map(s => (
                  <div key={s.store} className={`p-4 rounded-xl border-2 ${s.price === bestStore?.price ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <p className="font-bold">{s.store}</p>
                    <p className="text-xl font-bold text-blue-600">₹{s.price}</p>
                    {s.price === bestStore?.price && <p className="text-xs text-green-600 font-bold">✅ Sabse Sasta!</p>}
                    <a href={s.url} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-500 underline mt-1 block">Visit Store →</a>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => handleDelete(selectedProduct._id)}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600">
              🗑️ Product Delete Karo
            </button>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-6 mt-16 text-center">
        <p>© 2024 BuyWise AI v2.0 - Smart Price Tracking</p>
      </footer>
    </div>
  )
}
