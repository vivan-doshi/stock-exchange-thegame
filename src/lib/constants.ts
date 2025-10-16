import { Company, GameVariant } from '@/types';

// Standard variant companies (2-6 players)
export const STANDARD_COMPANIES: Omit<Company, 'currentPrice' | 'availableShares'>[] = [
  {
    id: 'atlas-bank',
    name: 'Atlas Bank',
    sector: 'Banking',
    startingPrice: 20,
    maxShares: 200000,
    volatility: 'low',
    priceCards: [-10, -5, 5, 10],
  },
  {
    id: 'titan-steel',
    name: 'Titan Steel',
    sector: 'Manufacturing',
    startingPrice: 25,
    maxShares: 200000,
    volatility: 'medium-low',
    priceCards: [-15, -10, -5, 5, 10, 15],
  },
  {
    id: 'global-industries',
    name: 'Global Industries',
    sector: 'Conglomerate',
    startingPrice: 45,
    maxShares: 200000,
    volatility: 'medium',
    priceCards: [-15, -10, -5, 5, 10, 15],
  },
  {
    id: 'omega-energy',
    name: 'Omega Energy',
    sector: 'Energy',
    startingPrice: 55,
    maxShares: 200000,
    volatility: 'medium-high',
    priceCards: [-20, -15, -10, -5, 5, 10, 15, 20],
  },
  {
    id: 'vitalcare-pharma',
    name: 'VitalCare Pharma',
    sector: 'Healthcare',
    startingPrice: 75,
    maxShares: 200000,
    volatility: 'high',
    priceCards: [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25],
  },
  {
    id: 'novatech',
    name: 'NovaTech',
    sector: 'Technology',
    startingPrice: 80,
    maxShares: 200000,
    volatility: 'very-high',
    priceCards: [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30],
  },
];

// Extended variant companies (7-12 players)
export const EXTENDED_COMPANIES: Omit<Company, 'currentPrice' | 'availableShares'>[] = [
  {
    id: 'atlas-bank',
    name: 'Atlas Bank',
    sector: 'Banking',
    startingPrice: 20,
    maxShares: 300000,
    volatility: 'low',
    priceCards: [-10, -5, 5, 10],
  },
  {
    id: 'titan-steel',
    name: 'Titan Steel',
    sector: 'Manufacturing',
    startingPrice: 25,
    maxShares: 300000,
    volatility: 'medium-low',
    priceCards: [-15, -10, -5, 5, 10, 15],
  },
  {
    id: 'global-industries',
    name: 'Global Industries',
    sector: 'Conglomerate',
    startingPrice: 45,
    maxShares: 300000,
    volatility: 'medium',
    priceCards: [-15, -10, -5, 5, 10, 15],
  },
  {
    id: 'omega-energy',
    name: 'Omega Energy',
    sector: 'Energy',
    startingPrice: 55,
    maxShares: 300000,
    volatility: 'medium-high',
    priceCards: [-20, -15, -10, -5, 5, 10, 15, 20],
  },
  {
    id: 'vitalcare-pharma',
    name: 'VitalCare Pharma',
    sector: 'Healthcare',
    startingPrice: 75,
    maxShares: 300000,
    volatility: 'high',
    priceCards: [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25],
  },
  {
    id: 'novatech',
    name: 'NovaTech',
    sector: 'Technology',
    startingPrice: 80,
    maxShares: 300000,
    volatility: 'very-high',
    priceCards: [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30],
  },
];

// Game constants
export const GAME_CONSTANTS = {
  TOTAL_ROUNDS: 10,
  TRANSACTIONS_PER_ROUND: 3,
  MIN_PURCHASE_AMOUNT: 5000,
  MIN_SHARES: 1000,
  SHARE_INCREMENT: 1000,

  STANDARD: {
    STARTING_CAPITAL: 600000,
    DECK_SIZE: 108,
    DIRECTOR_THRESHOLD: 50000,
    DIRECTOR_PERCENTAGE: 0.25,
    CHAIRMAN_THRESHOLD: 100000,
    CHAIRMAN_PERCENTAGE: 0.5,
    OPTIONS_LIMIT: 40000,
  },

  EXTENDED: {
    STARTING_CAPITAL: 450000,
    DECK_SIZE: 216,
    DIRECTOR_THRESHOLD: 60000,
    DIRECTOR_PERCENTAGE: 0.2,
    CHAIRMAN_THRESHOLD: 120000,
    CHAIRMAN_PERCENTAGE: 0.4,
    OPTIONS_LIMIT: 60000,
  },
};

// Helper function to get variant-specific constants
export function getVariantConstants(variant: GameVariant) {
  return variant === 'standard' ? GAME_CONSTANTS.STANDARD : GAME_CONSTANTS.EXTENDED;
}

// Helper function to get variant-specific companies
export function getVariantCompanies(variant: GameVariant) {
  return variant === 'standard' ? STANDARD_COMPANIES : EXTENDED_COMPANIES;
}
