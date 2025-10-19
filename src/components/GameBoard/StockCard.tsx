import React from 'react';

interface PlayerHolding {
  username: string;
  shares: number;
  isCurrentUser: boolean;
}

interface StockCardProps {
  company: string;
  sector: string;
  price: number;
  priceChange: number;
  startPrice: number;
  availableShares: number;
  yourShares: number;
  ownershipLevel: 'Director' | 'Chairman' | null;
  color: string;
  playerHoldings: PlayerHolding[];
}

const StockCard: React.FC<StockCardProps> = ({
  company,
  sector,
  price,
  priceChange,
  startPrice,
  availableShares,
  yourShares,
  ownershipLevel,
  color,
  playerHoldings
}) => {
  // Debug logging for Atlas Bank
  if (company === 'Atlas Bank') {
    console.log('[StockCard] Atlas Bank - playerHoldings received:', playerHoldings);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-900/50 to-blue-800/30',
        border: 'border-blue-500/30',
        text: 'text-blue-300',
        badge: 'bg-blue-500/20 border-blue-500/40 text-blue-200'
      },
      gray: {
        bg: 'bg-gradient-to-br from-gray-700/50 to-gray-600/30',
        border: 'border-gray-500/30',
        text: 'text-gray-300',
        badge: 'bg-gray-500/20 border-gray-500/40 text-gray-200'
      },
      teal: {
        bg: 'bg-gradient-to-br from-teal-900/50 to-teal-800/30',
        border: 'border-teal-500/30',
        text: 'text-teal-300',
        badge: 'bg-teal-500/20 border-teal-500/40 text-teal-200'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-900/50 to-orange-800/30',
        border: 'border-orange-500/30',
        text: 'text-orange-300',
        badge: 'bg-orange-500/20 border-orange-500/40 text-orange-200'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-900/50 to-green-800/30',
        border: 'border-green-500/30',
        text: 'text-green-300',
        badge: 'bg-green-500/20 border-green-500/40 text-green-200'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-900/50 to-purple-800/30',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        badge: 'bg-purple-500/20 border-purple-500/40 text-purple-200'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(color);
  const percentChange = ((priceChange / startPrice) * 100).toFixed(1);
  const isPositive = priceChange >= 0;

  return (
    <div
      className={`${colors.bg} backdrop-blur-sm border ${colors.border} rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{company}</h3>
          <p className={`text-xs ${colors.text}`}>{sector}</p>
        </div>
        {ownershipLevel && (
          <div className={`border ${colors.badge} rounded-full px-2 py-1 text-xs font-bold`}>
            {ownershipLevel}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-4xl font-bold text-white mb-1">
          {formatCurrency(price)}
        </div>
        <div className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{formatCurrency(priceChange)} ({isPositive ? '+' : ''}{percentChange}%)
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-300">
          <span>Available:</span>
          <span className="font-semibold">{availableShares.toLocaleString()}</span>
        </div>

        {/* Player Holdings */}
        {playerHoldings.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2 font-semibold">SHAREHOLDERS</div>
            <div className="space-y-1.5">
              {playerHoldings.map((holding, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center ${
                    holding.isCurrentUser ? 'text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  <span className="text-xs">
                    {holding.isCurrentUser ? '👤 ' : ''}
                    {holding.username}
                  </span>
                  <span className={`text-xs font-semibold ${holding.isCurrentUser ? 'text-blue-400' : ''}`}>
                    {holding.shares.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
