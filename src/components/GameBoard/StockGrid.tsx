import React from 'react';
import StockCard from './StockCard';

interface PlayerHolding {
  username: string;
  shares: number;
  isCurrentUser: boolean;
}

interface Stock {
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

interface StockGridProps {
  stocks: Stock[];
}

const StockGrid: React.FC<StockGridProps> = ({ stocks }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stocks.map((stock, index) => (
        <StockCard
          key={index}
          company={stock.company}
          sector={stock.sector}
          price={stock.price}
          priceChange={stock.priceChange}
          startPrice={stock.startPrice}
          availableShares={stock.availableShares}
          yourShares={stock.yourShares}
          ownershipLevel={stock.ownershipLevel}
          color={stock.color}
          playerHoldings={stock.playerHoldings}
        />
      ))}
    </div>
  );
};

export default StockGrid;
