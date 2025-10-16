export default function GamePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Stock Market Tycoon</h1>
          <p className="text-blue-300">Game Board - Coming Soon</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Market Board</h2>
            <p className="text-slate-300">Game interface will be implemented here</p>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Player Info</h3>
              <p className="text-slate-300">Cash: $600,000</p>
              <p className="text-slate-300">Net Worth: $600,000</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Round Info</h3>
              <p className="text-slate-300">Year: 1 of 10</p>
              <p className="text-slate-300">Transaction: 1 of 3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
