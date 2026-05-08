import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'https://buywise-ai-backend.onrender.com/api'

export default function App() {
  const [page, setPage] = useState('home')
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({ url: '', targetPrice: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`)
      setProducts(res.data.products || [])
    } catch (err) {
      console.log('Error:', err.message)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!formData.url || !formData.targetPrice) {
      setMessage('❌ सब fields भरो!')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/products`, {
        url: formData.url,
        targetPrice: parseFloat(formData.targetPrice),
        userId: 'user_123'
      })
      setMessage('✅ Product add हो गया!')
      setFormData({ url: '', targetPrice: '' })
      fetchProducts()
    } catch (err) {
      setMessage('❌ Error: ' + err.message)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`)
      setMessage('✅ Product delete हो गया!')
      fetchProducts()
    } catch (err) {
      setMessage('❌ Error: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">💰 BuyWise AI v2.0</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage('home')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${page === 'home' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              🏠 Home
            </button>
            <button 
              onClick={() => setPage('add')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${page === 'add' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              ➕ Add Product
            </button>
            <button 
              onClick={() => setPage('dashboard')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${page === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              📊 Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4">
        {/* HOME PAGE */}
        {page === 'home' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-white mb-4">Smart Price Tracker</h2>
              <p className="text-xl text-gray-200">Track prices across 6 stores and save money!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-xl font-bold mb-2">Discover Products</h3>
                <p className="text-gray-600">Paste any product URL from Amazon, Flipkart, Croma and more</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold mb-2">Track Prices</h3>
                <p className="text-gray-600">View 1 year price history with charts</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-3">🔔</div>
                <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
                <p className="text-gray-600">Get notified when price drops below your target</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h3 className="text-2xl font-bold mb-6 text-center">Supported Stores</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                {['Amazon','Flipkart','Croma','BigBasket','Blinkit','Myntra'].map(s => (
                  <div key={s} className="p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50">
                    <p className="font-semibold text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-100 rounded-full">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-700 font-semibold">Backend Live</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready to Track!</h3>
              <button 
                onClick={() => setPage('add')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700"
              >
                🚀 Get Started
              </button>
            </div>
          </div>
        )}

        {/* ADD PRODUCT PAGE */}
        {page === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Add Product</h2>

              {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Product URL</label>
                  <input
                    type="url"
                    placeholder="https://www.amazon.com/..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Target Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : '✨ Add & Track'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD PAGE */}
        {page === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Your Products</h2>

            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No products yet</p>
                <button 
                  onClick={() => setPage('add')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-3">{product.name || 'Product'}</h3>
                    <div className="mb-3">
                      <p className="text-gray-600 text-sm">Current Price</p>
                      <p className="text-2xl font-bold text-blue-600">₹{product.currentPrice || 0}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">Target Price</p>
                      <p className="text-lg font-semibold">₹{product.targetPrice}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-6 mt-16 text-center">
        <p>© 2024 BuyWise AI v2.0 - Smart Price Tracking</p>
      </footer>
    </div>
  )
}
