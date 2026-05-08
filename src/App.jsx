export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">💰 BuyWise AI v2.0</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Login</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Smart Price Tracker</h2>
          <p className="text-xl text-gray-200">Track prices across 6 stores and save money!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold mb-2">Discover Products</h3>
            <p className="text-gray-600">Paste any product URL from Amazon, Flipkart, Croma and more</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Track Prices</h3>
            <p className="text-gray-600">View 1 year price history with charts</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
            <p className="text-gray-600">Get notified when price drops below your target</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Supported Stores</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {['Amazon','Flipkart','Croma','BigBasket','Blinkit','Myntra'].map(s => (
              <div key={s} className="p-3 border-2 border-blue-200 rounded-lg">
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
          <p className="text-gray-500 mb-6 text-sm">buywise-ai-backend.onrender.com</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700">
            🚀 Get Started
          </button>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-6 mt-16 text-center">
        <p>© 2024 BuyWise AI v2.0 - Smart Price Tracking</p>
      </footer>
    </div>
  )
}
