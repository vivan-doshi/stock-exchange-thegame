import React from 'react';
import TopBar from '../components/GameBoard/TopBar';
import PortfolioPanel from '../components/GameBoard/PortfolioPanel';
import StockGrid from '../components/GameBoard/StockGrid';
import TransactionPanel from '../components/GameBoard/TransactionPanel';
import BottomSection from '../components/GameBoard/BottomSection';

/**
 * Test page to view the GameBoard UI with placeholder data
 * Access at: /test-game-board
 */
const TestGameBoard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top Bar */}
      <TopBar
        currentRound={3}
        totalRounds={10}
        currentTransaction={2}
        totalTransactions={3}
        currentPlayerName="Alex Chen"
      />

      {/* Main Game Area */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Portfolio (25%) */}
          <div className="lg:col-span-3">
            <PortfolioPanel
              cash={450000}
              stockValue={150000}
              netWorth={600000}
              holdings={[
                { company: 'NovaTech', shares: 1000, value: 80000, color: 'purple' },
                { company: 'VitalCare Pharma', shares: 800, value: 60000, color: 'green' },
                { company: 'Atlas Bank', shares: 500, value: 10000, color: 'blue' }
              ]}
            />
          </div>

          {/* Center Column - Stock Cards (50%) */}
          <div className="lg:col-span-6">
            <StockGrid
              stocks={[
                {
                  company: 'Atlas Bank',
                  sector: 'Banking & Financial Services',
                  price: 20,
                  priceChange: 0,
                  startPrice: 20,
                  availableShares: 199500,
                  yourShares: 500,
                  ownershipLevel: null,
                  color: 'blue'
                },
                {
                  company: 'Titan Steel',
                  sector: 'Manufacturing & Industrial',
                  price: 25,
                  priceChange: 0,
                  startPrice: 25,
                  availableShares: 200000,
                  yourShares: 0,
                  ownershipLevel: null,
                  color: 'gray'
                },
                {
                  company: 'Global Industries',
                  sector: 'Conglomerate',
                  price: 45,
                  priceChange: 0,
                  startPrice: 45,
                  availableShares: 200000,
                  yourShares: 0,
                  ownershipLevel: null,
                  color: 'teal'
                },
                {
                  company: 'Omega Energy',
                  sector: 'Energy & Power',
                  price: 55,
                  priceChange: 0,
                  startPrice: 55,
                  availableShares: 200000,
                  yourShares: 0,
                  ownershipLevel: null,
                  color: 'orange'
                },
                {
                  company: 'VitalCare Pharma',
                  sector: 'Healthcare & Pharmaceuticals',
                  price: 75,
                  priceChange: 0,
                  startPrice: 75,
                  availableShares: 199200,
                  yourShares: 800,
                  ownershipLevel: null,
                  color: 'green'
                },
                {
                  company: 'NovaTech',
                  sector: 'Technology & Innovation',
                  price: 80,
                  priceChange: 0,
                  startPrice: 80,
                  availableShares: 199000,
                  yourShares: 1000,
                  ownershipLevel: null,
                  color: 'purple'
                }
              ]}
            />
          </div>

          {/* Right Column - Transaction Panel (25%) */}
          <div className="lg:col-span-3">
            <TransactionPanel
              isDirector={false}
              isChairman={false}
              canAct={true}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section - Card Reveal & Transaction Log */}
      <BottomSection
        revealedCards={[]}
        recentTransactions={[]}
      />

      {/* Test Info Banner */}
      <div className="fixed bottom-4 right-4 bg-yellow-500/90 text-black px-4 py-2 rounded-lg shadow-lg">
        <p className="font-semibold text-sm">Test Mode - Placeholder Data</p>
      </div>
    </div>
  );
};

export default TestGameBoard;
