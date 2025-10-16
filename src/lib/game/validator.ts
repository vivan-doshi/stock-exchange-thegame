/**
 * Validator Module
 * Handles validation logic for stock transactions in Stock Market Tycoon
 */

import type { Card } from './deck';

export interface Player {
  id: string;
  cash: number;
  holdings: Record<string, number>; // stock name -> shares owned
  cards?: Card[]; // cards in hand
}

export interface Stock {
  name: string;
  currentPrice: number;
  availableShares: number; // Shares still available in the market
  totalShares: number; // Total shares for this stock (200k or 300k)
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Check if a player can buy a stock based on their cards
 *
 * Buy Condition Rules:
 * 1. The sum of all price cards for that stock must be >= 0
 * 2. EXCEPTION: If this is the first buyer of the stock in the current market year,
 *    they can buy even with negative cards
 *
 * @param cards - All cards the player has for this specific stock
 * @param isFirstBuyer - Whether this player is the first to buy this stock in the current market year
 * @returns ValidationResult indicating if the purchase is allowed
 */
export function canBuyStock(cards: Card[], isFirstBuyer: boolean = false): ValidationResult {
  // Filter to only price cards for validation
  const priceCards = cards.filter((card) => card.type === 'price' && card.value !== undefined);

  // If no cards, cannot buy (unless first buyer with special rules)
  if (priceCards.length === 0 && !isFirstBuyer) {
    return {
      valid: false,
      reason: 'No price cards available for this stock'
    };
  }

  // Calculate the sum of all card values
  const cardSum = priceCards.reduce((sum, card) => sum + (card.value || 0), 0);

  // First buyer exception - can buy regardless of card sum
  if (isFirstBuyer) {
    return {
      valid: true,
      reason: 'First buyer can purchase with any cards'
    };
  }

  // Standard rule: sum must be >= 0
  if (cardSum >= 0) {
    return {
      valid: true,
      reason: `Card sum is ${cardSum} (>= 0)`
    };
  }

  return {
    valid: false,
    reason: `Card sum is ${cardSum} (must be >= 0 to buy)`
  };
}

/**
 * Validate if a player can complete a purchase transaction
 *
 * Checks:
 * 1. Player has enough cash to afford the purchase
 * 2. Enough shares are available in the market
 * 3. Quantity is within valid ranges (minimum 1,000 shares, multiples of 1,000)
 * 4. Price is positive
 *
 * @param player - The player attempting to buy
 * @param stock - The stock being purchased
 * @param quantity - Number of shares to purchase
 * @param price - Price per share
 * @returns ValidationResult indicating if the purchase can proceed
 */
export function validatePurchase(
  player: Player,
  stock: Stock,
  quantity: number,
  price: number
): ValidationResult {
  // Check minimum quantity (1,000 shares)
  if (quantity < 1000) {
    return {
      valid: false,
      reason: 'Minimum purchase is 1,000 shares'
    };
  }

  // Check quantity is in multiples of 1,000
  if (quantity % 1000 !== 0) {
    return {
      valid: false,
      reason: 'Must buy in multiples of 1,000 shares'
    };
  }

  // Check if price is valid
  if (price <= 0) {
    return {
      valid: false,
      reason: 'Stock price must be positive'
    };
  }

  // Check if enough shares are available
  if (quantity > stock.availableShares) {
    return {
      valid: false,
      reason: `Only ${stock.availableShares.toLocaleString()} shares available (requested ${quantity.toLocaleString()})`
    };
  }

  // Calculate total cost
  const totalCost = quantity * price;

  // Check if player has enough cash
  if (player.cash < totalCost) {
    return {
      valid: false,
      reason: `Insufficient funds: need $${totalCost.toLocaleString()}, have $${player.cash.toLocaleString()}`
    };
  }

  // Validate minimum transaction value ($5,000)
  const minimumTransactionValue = 5000;
  if (totalCost < minimumTransactionValue) {
    return {
      valid: false,
      reason: `Minimum transaction value is $${minimumTransactionValue.toLocaleString()}`
    };
  }

  return {
    valid: true,
    reason: 'Purchase valid'
  };
}

/**
 * Validate if a player can sell shares
 *
 * Checks:
 * 1. Player owns the stock
 * 2. Player owns enough shares to sell
 * 3. Quantity is within valid ranges (minimum 1,000 shares, multiples of 1,000)
 *
 * @param player - The player attempting to sell
 * @param stock - The stock being sold
 * @param quantity - Number of shares to sell
 * @returns ValidationResult indicating if the sale can proceed
 */
export function validateSale(player: Player, stock: Stock, quantity: number): ValidationResult {
  // Check minimum quantity (1,000 shares)
  if (quantity < 1000) {
    return {
      valid: false,
      reason: 'Minimum sale is 1,000 shares'
    };
  }

  // Check quantity is in multiples of 1,000
  if (quantity % 1000 !== 0) {
    return {
      valid: false,
      reason: 'Must sell in multiples of 1,000 shares'
    };
  }

  // Check if player owns the stock
  const ownedShares = player.holdings[stock.name] || 0;

  if (ownedShares === 0) {
    return {
      valid: false,
      reason: `You don't own any ${stock.name} shares`
    };
  }

  // Check if player owns enough shares
  if (quantity > ownedShares) {
    return {
      valid: false,
      reason: `Insufficient shares: own ${ownedShares.toLocaleString()}, attempting to sell ${quantity.toLocaleString()}`
    };
  }

  return {
    valid: true,
    reason: 'Sale valid'
  };
}

/**
 * Validate if a player can afford a short position (Investor Mode)
 *
 * Checks for shorting:
 * 1. Player doesn't currently own the stock
 * 2. Quantity is within valid range (1,000 to 12,000 shares)
 * 3. Total shorted shares for this stock across all players doesn't exceed 12,000
 *
 * @param player - The player attempting to short
 * @param stock - The stock being shorted
 * @param quantity - Number of shares to short
 * @param totalShortedByAllPlayers - Total shares already shorted by all players for this stock
 * @returns ValidationResult indicating if the short can proceed
 */
export function validateShort(
  player: Player,
  stock: Stock,
  quantity: number,
  totalShortedByAllPlayers: number = 0
): ValidationResult {
  // Check if player owns the stock (cannot short what you own)
  const ownedShares = player.holdings[stock.name] || 0;
  if (ownedShares > 0) {
    return {
      valid: false,
      reason: `Cannot short ${stock.name} - you currently own ${ownedShares.toLocaleString()} shares`
    };
  }

  // Check minimum and maximum for individual short (1,000 to 12,000)
  if (quantity < 1000 || quantity > 12000) {
    return {
      valid: false,
      reason: 'Short position must be between 1,000 and 12,000 shares'
    };
  }

  // Check if quantity is in multiples of 1,000
  if (quantity % 1000 !== 0) {
    return {
      valid: false,
      reason: 'Must short in multiples of 1,000 shares'
    };
  }

  // Check total market short limit (12,000 total across all players)
  if (totalShortedByAllPlayers + quantity > 12000) {
    return {
      valid: false,
      reason: `Market short limit exceeded: ${totalShortedByAllPlayers.toLocaleString()} already shorted, max is 12,000`
    };
  }

  return {
    valid: true,
    reason: 'Short position valid'
  };
}

/**
 * Validate if a player can use a special card
 *
 * @param player - The player attempting to use the card
 * @param card - The special card being used
 * @param gameState - Additional game state needed for validation
 * @returns ValidationResult indicating if the card can be used
 */
export function validateSpecialCard(
  _player: Player,
  card: Card,
  gameState?: {
    stockPrice?: number;
    stockStartingPrice?: number;
    ownedShares?: number;
  }
): ValidationResult {
  if (card.type !== 'special') {
    return {
      valid: false,
      reason: 'Card is not a special card'
    };
  }

  switch (card.specialType) {
    case 'loan_stocks_matured':
      // Can always use during transaction round
      return {
        valid: true,
        reason: 'Can claim loan maturity'
      };

    case 'debenture':
      // Must own shares and stock must have hit $0 in same round
      if (!gameState?.ownedShares || gameState.ownedShares === 0) {
        return {
          valid: false,
          reason: 'Must own shares to use Debenture'
        };
      }
      if (gameState?.stockPrice !== 0) {
        return {
          valid: false,
          reason: 'Stock must be at $0 to use Debenture'
        };
      }
      return {
        valid: true,
        reason: 'Can use Debenture for face value recovery'
      };

    case 'rights_issued':
      // Must own shares to exercise rights
      if (!gameState?.ownedShares || gameState.ownedShares === 0) {
        return {
          valid: false,
          reason: 'Must own shares to use Rights Issued'
        };
      }
      return {
        valid: true,
        reason: 'Can exercise rights (1 share per 2 owned at $10/share)'
      };

    case 'share_suspended':
    case 'currency_plus_10':
    case 'currency_minus_10':
      // These are end-of-year cards, always valid to hold
      return {
        valid: true,
        reason: 'End-of-year card will be applied automatically'
      };

    default:
      return {
        valid: false,
        reason: 'Unknown special card type'
      };
  }
}
