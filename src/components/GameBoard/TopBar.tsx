import React from 'react';

interface TopBarProps {
  currentRound: number;
  totalRounds: number;
  currentTransaction: number;
  totalTransactions: number;
  currentPlayerName: string;
}

const TopBar: React.FC<TopBarProps> = ({
  currentRound,
  totalRounds,
  currentTransaction,
  totalTransactions,
  currentPlayerName
}) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Round Indicator */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
              <div className="text-xs text-blue-300 font-medium">ROUND</div>
              <div className="text-lg font-bold text-blue-100">
                {currentRound} <span className="text-sm text-blue-400">of {totalRounds}</span>
              </div>
            </div>
          </div>

          {/* Transaction Indicator */}
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
              <div className="text-xs text-purple-300 font-medium">TRANSACTION</div>
              <div className="text-lg font-bold text-purple-100">
                {currentTransaction} <span className="text-sm text-purple-400">of {totalTransactions}</span>
              </div>
            </div>
          </div>

          {/* Current Player */}
          <div className="flex items-center gap-2">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
              <div className="text-xs text-green-300 font-medium">CURRENT TURN</div>
              <div className="text-lg font-bold text-green-100">
                {currentPlayerName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
