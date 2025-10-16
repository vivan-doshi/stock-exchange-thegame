import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  availableShares: number;
  color: string;
}

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  playerCash: number;
  onConfirm: (stockSymbol: string, quantity: number) => void;
}

const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  stocks,
  playerCash,
  onConfirm
}) => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0].symbol);
    }
  }, [isOpen, stocks]);

  useEffect(() => {
    setError('');
  }, [selectedStock, quantity]);

  if (!isOpen) return null;

  const selectedStockData = stocks.find(s => s.symbol === selectedStock);
  const totalCost = selectedStockData ? selectedStockData.price * quantity : 0;
  const minTransactionValue = 5000;
  const minShares = 1000;

  const validateTransaction = (): string | null => {
    if (!selectedStockData) return 'Please select a stock';
    if (quantity < minShares) return `Minimum purchase is ${minShares.toLocaleString()} shares`;
    if (quantity % 1000 !== 0) return 'Quantity must be in increments of 1,000 shares';
    if (totalCost > playerCash) return 'Insufficient cash';
    if (quantity > selectedStockData.availableShares) return 'Insufficient shares available in market';
    if (totalCost < minTransactionValue) return `Minimum transaction value is $${minTransactionValue.toLocaleString()}`;
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
    const newQuantity = Math.max(minShares, quantity + amount);
    setQuantity(newQuantity);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Buy Stocks</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Stock Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Stock
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {stocks.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.name} - ${stock.price} ({stock.availableShares.toLocaleString()} available)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity (in thousands)
            </label>
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
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                step={1000}
                min={minShares}
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
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Total Cost:</span>
                <span className="text-green-400 font-bold text-lg">${totalCost.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Cash:</span>
              <span className="text-white">${playerCash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Remaining:</span>
              <span className={playerCash - totalCost >= 0 ? 'text-green-400' : 'text-red-400'}>
                ${(playerCash - totalCost).toLocaleString()}
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
              • Minimum transaction: ${minTransactionValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
