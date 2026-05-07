export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💰</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BuyWise AI v2.0
            </h1>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Smart Price Tracker</h2>
          <p className="text-xl text-gray-200">Track prices across 6 stores & save money!</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Discover Products</h3>
            <p className="text-gray-600">Add products by URL from Amazon, Flipkart, Croma & more</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Track Prices</h3>
            <p className="text-gray-600">See 1-year price history with charts</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
            <p className="text-gray-600">Get notified when price drops below your target</p>
          </div>
        </div>

        {/* Supported Stores */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6">Supported Stores</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {['Amazon', 'Flipkart', 'Croma', 'BigBasket', 'Blinkit', 'Myntra'].map(store => (
              <div key={store} className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50">
                <p className="font-semibold">{store}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">✅ Backend Connected</h3>
          <p className="text-gray-600 mb-6">https://buywise-ai-backend.onrender.com/api</p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-lg">
            🚀 Get Started
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16 text-center">
        <p className="font-semibold">© 2024 BuyWise AI v2.0 - Smart Price Tracking</p>
      </footer>
    </div>
  )
}
