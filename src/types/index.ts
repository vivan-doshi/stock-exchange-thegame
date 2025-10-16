// Game variant types
export type GameVariant = 'standard' | 'extended';

// Game mode types
export type GameMode = 'trader' | 'investor' | 'strategist' | 'tycoon' | 'mogul';

// Stock company types
export interface Company {
  id: string;
  name: string;
  sector: string;
  startingPrice: number;
  currentPrice: number;
  maxShares: number;
  volatility: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'very-high';
  availableShares: number;
  priceCards: number[];
}

// Player types
export interface Player {
  id: string;
  name: string;
  cash: number;
  portfolio: Portfolio;
  netWorth: number;
  isDealer: boolean;
  cards: Card[];
}

// Portfolio types
export interface Portfolio {
  [companyId: string]: {
    shares: number;
    averagePrice: number;
  };
}

// Card types
export type CardType =
  | 'price'
  | 'loan-stocks-matured'
  | 'debenture'
  | 'rights-issued'
  | 'share-suspended'
  | 'currency-plus'
  | 'currency-minus';

export interface Card {
  id: string;
  type: CardType;
  companyId?: string;
  value?: number;
}

// Transaction types
export type TransactionType = 'buy' | 'sell' | 'special-card' | 'short' | 'option' | 'dividend' | 'buyback';

export interface Transaction {
  playerId: string;
  type: TransactionType;
  companyId: string;
  shares?: number;
  price: number;
  timestamp: number;
}

// Game state types
export interface GameState {
  variant: GameVariant;
  mode: GameMode;
  currentRound: number;
  currentTransaction: number;
  players: Player[];
  companies: Company[];
  deck: Card[];
  currentPlayerIndex: number;
  dealerIndex: number;
  transactions: Transaction[];
}

// Special power types
export type OwnershipLevel = 'none' | 'director' | 'chairman';

export interface Ownership {
  companyId: string;
  shares: number;
  percentage: number;
  level: OwnershipLevel;
}
