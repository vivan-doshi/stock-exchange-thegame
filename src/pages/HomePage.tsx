import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function HomePage() {
  const { user, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with User Menu */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Stock Market Tycoon</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-white text-sm hidden sm:inline">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </span>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-white/10 py-2 z-10">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-sm text-gray-400">Signed in as</p>
                  <p className="text-sm text-white font-medium truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Player'}!
          </h1>
          <p className="text-lg sm:text-xl text-blue-200">
            Ready to dominate the stock market?
          </p>
        </div>

        {/* What is Stock Market Tycoon */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sm:p-8 mb-12 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">What is Stock Market Tycoon?</h2>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
            Stock Market Tycoon is a strategic multiplayer board game where you buy and sell shares,
            manipulate markets, and outsmart your opponents to become the wealthiest investor.
            Navigate through 10 rounds of intense trading, manage your portfolio across 6 diverse companies,
            and use strategic cards to gain the upper hand. Will you play it safe or take risks for bigger rewards?
          </p>
        </div>

        {/* Game Modes */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">Choose Your Game Mode</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Trader Mode - Unlocked */}
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/50 hover:border-green-400 transition-all transform hover:scale-105 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded">UNLOCKED</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Trader</h3>
              <p className="text-green-100 mb-6 text-sm leading-relaxed">
                Quick trades, fast gains! Master the art of buying low and selling high in this fast-paced mode.
                Perfect for beginners and quick matches.
              </p>
              <Link
                to="/game"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
              >
                Play Now
              </Link>
            </div>

            {/* Investor Mode - Locked */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-600/50 relative opacity-75">
              <div className="absolute top-4 right-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="w-12 h-12 bg-blue-500/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">Investor</h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Build a diverse portfolio and think long-term. Become a company director and earn dividends.
                Strategic depth for experienced players.
              </p>
              <button
                disabled
                className="block w-full bg-gray-700 text-gray-400 font-bold py-3 px-4 rounded-lg text-center cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

            {/* Strategist Mode - Locked */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-600/50 relative opacity-75">
              <div className="absolute top-4 right-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="w-12 h-12 bg-purple-500/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">Strategist</h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Master advanced tactics with special cards, loans, and market manipulation.
                The ultimate challenge for expert players seeking complexity.
              </p>
              <button
                disabled
                className="block w-full bg-gray-700 text-gray-400 font-bold py-3 px-4 rounded-lg text-center cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* How to Play Button */}
        <div className="text-center">
          <Link
            to="/tutorial"
            className="inline-flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>How to Play</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/10 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            Stock Market Tycoon &copy; 2025 - Strategic Trading Board Game
          </p>
        </div>
      </footer>
    </div>
  )
}
