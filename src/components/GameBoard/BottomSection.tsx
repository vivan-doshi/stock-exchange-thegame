import React from 'react';

interface RevealedCard {
  type: 'price' | 'event';
  company: string | null;
  value: string;
}

interface Transaction {
  player: string;
  action: string;
  timestamp: string;
}

interface BottomSectionProps {
  revealedCards: RevealedCard[];
  recentTransactions: Transaction[];
}

const BottomSection: React.FC<BottomSectionProps> = ({
  revealedCards,
  recentTransactions
}) => {
  return (
    <div className="max-w-[1800px] mx-auto px-4 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Reveal Area */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-slate-200 mb-3">Revealed Cards</h3>
          {revealedCards.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No cards revealed yet
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {revealedCards.map((card, index) => (
                <div
                  key={index}
                  className={`flex-1 min-w-[150px] border rounded-lg p-4 ${
                    card.type === 'price'
                      ? 'bg-blue-500/20 border-blue-500/30'
                      : 'bg-purple-500/20 border-purple-500/30'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">
                    {card.type === 'price' ? 'PRICE CARD' : 'EVENT CARD'}
                  </div>
                  {card.company && (
                    <div className="font-semibold text-white text-sm mb-1">
                      {card.company}
                    </div>
                  )}
                  <div
                    className={`text-2xl font-bold ${
                      card.value.startsWith('+')
                        ? 'text-green-400'
                        : card.value.startsWith('-')
                        ? 'text-red-400'
                        : 'text-white'
                    }`}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Log */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-slate-200 mb-3">Recent Activity</h3>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-white text-sm">
                      {transaction.player}
                    </span>
                    <span className="text-xs text-slate-400">
                      {transaction.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{transaction.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomSection;
