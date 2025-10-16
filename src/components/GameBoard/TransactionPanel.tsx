import React from 'react';

interface TransactionPanelProps {
  isDirector: boolean;
  isChairman: boolean;
  canAct: boolean;
  onBuy?: () => void;
  onSell?: () => void;
  onPass?: () => void;
}

const TransactionPanel: React.FC<TransactionPanelProps> = ({
  isDirector,
  isChairman,
  canAct,
  onBuy,
  onSell,
  onPass
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-slate-200">Actions</h2>

      {/* Main Actions */}
      <div className="space-y-3 mb-6">
        <button
          onClick={onBuy}
          disabled={!canAct}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed border border-green-500 hover:border-green-400 disabled:border-slate-500 rounded-lg py-3 px-4 font-bold text-white transition-all transform hover:scale-105 disabled:hover:scale-100"
        >
          BUY
        </button>

        <button
          onClick={onSell}
          disabled={!canAct}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed border border-red-500 hover:border-red-400 disabled:border-slate-500 rounded-lg py-3 px-4 font-bold text-white transition-all transform hover:scale-105 disabled:hover:scale-100"
        >
          SELL
        </button>

        <button
          onClick={onPass}
          disabled={!canAct}
          className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed border border-slate-500 hover:border-slate-400 disabled:border-slate-600 rounded-lg py-3 px-4 font-bold text-white transition-all transform hover:scale-105 disabled:hover:scale-100"
        >
          PASS
        </button>
      </div>

      {/* Power Buttons */}
      {(isDirector || isChairman) && (
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            {isChairman ? 'Chairman Powers' : 'Director Powers'}
          </h3>
          <div className="space-y-2">
            {isChairman ? (
              <>
                <button
                  disabled={!canAct}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed border border-purple-500 hover:border-purple-400 disabled:border-slate-500 rounded-lg py-2 px-3 text-sm font-semibold text-white transition-all"
                >
                  Suppress Price Card
                </button>
                <button
                  disabled={!canAct}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed border border-purple-500 hover:border-purple-400 disabled:border-slate-500 rounded-lg py-2 px-3 text-sm font-semibold text-white transition-all"
                >
                  Replace Price Card
                </button>
              </>
            ) : (
              <button
                disabled={!canAct}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed border border-blue-500 hover:border-blue-400 disabled:border-slate-500 rounded-lg py-2 px-3 text-sm font-semibold text-white transition-all"
              >
                Suppress One Price Card
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isChairman
              ? 'Use powers during card reveal phase'
              : 'Use power during card reveal phase'
            }
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="text-xs text-blue-300 font-medium mb-1">TIP</div>
        <p className="text-xs text-slate-300">
          Select a stock card above to view details and make a transaction.
        </p>
      </div>
    </div>
  );
};

export default TransactionPanel;
