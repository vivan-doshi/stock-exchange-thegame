import React from 'react';

interface Holding {
  company: string;
  shares: number;
  value: number;
  color: string;
}

interface PortfolioPanelProps {
  cash: number;
  stockValue: number;
  netWorth: number;
  holdings: Holding[];
}

const PortfolioPanel: React.FC<PortfolioPanelProps> = ({
  cash,
  stockValue,
  netWorth,
  holdings
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'border-purple-500/30 bg-purple-500/10',
      green: 'border-green-500/30 bg-green-500/10',
      orange: 'border-orange-500/30 bg-orange-500/10',
      blue: 'border-blue-500/30 bg-blue-500/10',
      gray: 'border-gray-500/30 bg-gray-500/10',
      teal: 'border-teal-500/30 bg-teal-500/10'
    };
    return colorMap[color] || 'border-slate-500/30 bg-slate-500/10';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-slate-200">Your Portfolio</h2>

      {/* Summary Stats */}
      <div className="space-y-3 mb-6">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
          <div className="text-xs text-green-300 font-medium mb-1">CASH</div>
          <div className="text-2xl font-bold text-green-100">{formatCurrency(cash)}</div>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <div className="text-xs text-blue-300 font-medium mb-1">STOCK VALUE</div>
          <div className="text-xl font-semibold text-blue-100">{formatCurrency(stockValue)}</div>
        </div>

        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-300 font-medium mb-1">NET WORTH</div>
          <div className="text-3xl font-bold text-purple-100">{formatCurrency(netWorth)}</div>
        </div>
      </div>

      {/* Holdings List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Holdings</h3>
        {holdings.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4">
            No holdings yet
          </div>
        ) : (
          <div className="space-y-2">
            {holdings.map((holding, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getColorClasses(holding.color)}`}
              >
                <div className="font-semibold text-sm text-slate-200 mb-1">
                  {holding.company}
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{holding.shares.toLocaleString()} shares</span>
                  <span className="font-semibold text-slate-300">
                    {formatCurrency(holding.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPanel;
