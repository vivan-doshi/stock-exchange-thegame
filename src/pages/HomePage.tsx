import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Stock Market Tycoon
        </h1>
        <p className="text-xl text-blue-200 mb-8">
          A strategic stock market simulation game for 2-12 players
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
            <h3 className="text-2xl font-semibold text-white mb-2">Standard Mode</h3>
            <p className="text-blue-100 mb-4">2-6 Players</p>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>Starting Capital: $600,000</li>
              <li>108 Card Deck</li>
              <li>200,000 Shares per Stock</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
            <h3 className="text-2xl font-semibold text-white mb-2">Extended Mode</h3>
            <p className="text-blue-100 mb-4">7-12 Players</p>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>Starting Capital: $450,000</li>
              <li>216 Card Deck (2x)</li>
              <li>300,000 Shares per Stock</li>
            </ul>
          </div>
        </div>

        <Link
          to="/game"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
        >
          Start New Game
        </Link>
      </div>
    </div>
  )
}
