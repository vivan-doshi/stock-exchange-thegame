import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface OwnedStock {
  symbol: string;
  name: string;
  price: number;
  sharesOwned: number;
  color: string;
}

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedStocks: OwnedStock[];
  onConfirm: (stockSymbol: string, quantity: number) => void;
}

const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  ownedStocks,
  onConfirm
}) => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && ownedStocks.length > 0 && !selectedStock) {
      setSelectedStock(ownedStocks[0].symbol);
    }
  }, [isOpen, ownedStocks]);

  useEffect(() => {
    setError('');
  }, [selectedStock, quantity]);

  if (!isOpen) return null;

  const selectedStockData = ownedStocks.find(s => s.symbol === selectedStock);
  const totalProceeds = selectedStockData ? selectedStockData.price * quantity : 0;
  const minShares = 1000;

  const validateTransaction = (): string | null => {
    if (!selectedStockData) return 'Please select a stock';
    if (quantity < minShares) return `Minimum sale is ${minShares.toLocaleString()} shares`;
    if (quantity % 1000 !== 0) return 'Quantity must be in increments of 1,000 shares';
    if (quantity > selectedStockData.sharesOwned) return `You only own ${selectedStockData.sharesOwned.toLocaleString()} shares`;
    return null;
  };

  const handleConfirm = () => {
    const validationError = validateTransaction();
    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(selectedStock, quantity);
    handleClose();
  };

  const handleClose = () => {
    setSelectedStock('');
    setQuantity(1000);
    setError('');
    onClose();
  };

  const incrementQuantity = (amount: number) => {
    const newQuantity = Math.max(0, quantity + amount);
    const maxQuantity = selectedStockData?.sharesOwned || 0;
    setQuantity(Math.min(newQuantity, maxQuantity));
  };

  const sellAll = () => {
    if (selectedStockData) {
      setQuantity(selectedStockData.sharesOwned);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Sell Stocks</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {ownedStocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">You don't own any stocks to sell.</p>
            </div>
          ) : (
            <>
              {/* Stock Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Stock to Sell
                </label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {ownedStocks.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.name} - ${stock.price} ({stock.sharesOwned.toLocaleString()} owned)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Quantity (in thousands)
                  </label>
                  <button
                    onClick={sellAll}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    Sell All
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => incrementQuantity(-1000)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    -1k
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setQuantity(Math.min(val, selectedStockData?.sharesOwned || 0));
                    }}
                    step={1000}
                    min={0}
                    max={selectedStockData?.sharesOwned || 0}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => incrementQuantity(1000)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    +1k
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => incrementQuantity(-10000)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    -10k
                  </button>
                  <button
                    onClick={() => incrementQuantity(10000)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    +10k
                  </button>
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Price per share:</span>
                  <span className="text-white font-medium">${selectedStockData?.price || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="text-white font-medium">{quantity.toLocaleString()} shares</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">You own:</span>
                  <span className="text-white">{selectedStockData?.sharesOwned.toLocaleString()} shares</span>
                </div>
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Total Proceeds:</span>
                    <span className="text-green-400 font-bold text-lg">${totalProceeds.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Remaining shares:</span>
                  <span className="text-white">
                    {((selectedStockData?.sharesOwned || 0) - quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Validation Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  • Minimum: {minShares.toLocaleString()} shares<br />
                  • Increments: 1,000 shares<br />
                  • Maximum: {selectedStockData?.sharesOwned.toLocaleString() || 0} shares (your holdings)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {ownedStocks.length > 0 && (
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Confirm Sale
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellModal;
