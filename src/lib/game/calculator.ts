/**
 * Calculator Module
 * Handles calculations for prices, ownership, and net worth in Stock Market Tycoon
 */

import type { Card } from './deck';

export type OwnershipStatus = 'none' | 'director' | 'chairman';

export interface StockHolding {
  shares: number;
  currentPrice: number;
}

/**
 * Calculate the new stock price based on card values
 *
 * Rules:
 * 1. Sum all price card values for the stock
 * 2. Add the sum to the current price
 * 3. Stock price cannot go below $0
 *
 * @param currentPrice - Current stock price
 * @param cards - Array of price cards to apply
 * @returns The new calculated price (minimum $0)
 */
export function calculateNewPrice(currentPrice: number, cards: Card[]): number {
  // Filter to only price cards and sum their values
  const priceCards = cards.filter((card) => card.type === 'price' && card.value !== undefined);

  const totalChange = priceCards.reduce((sum, card) => sum + (card.value || 0), 0);

  const newPrice = currentPrice + totalChange;

  // Stock price cannot go below $0
  return Math.max(0, newPrice);
}

/**
 * Calculate price change from a set of cards
 *
 * @param cards - Array of price cards
 * @returns The total price change (can be negative)
 */
export function calculatePriceChange(cards: Card[]): number {
  const priceCards = cards.filter((card) => card.type === 'price' && card.value !== undefined);

  return priceCards.reduce((sum, card) => sum + (card.value || 0), 0);
}

/**
 * Calculate ownership percentage for a player
 *
 * @param playerShares - Number of shares owned by the player
 * @param totalShares - Total shares outstanding for the stock
 * @returns Ownership percentage (0-100)
 */
export function calculateOwnership(playerShares: number, totalShares: number): number {
  if (totalShares === 0) {
    return 0;
  }

  return (playerShares / totalShares) * 100;
}

/**
 * Get the ownership status based on ownership percentage
 *
 * Thresholds:
 * - Standard Variant (200,000 shares):
 *   - Director: 25% (50,000 shares)
 *   - Chairman: 50% (100,000 shares)
 * - Extended Variant (300,000 shares):
 *   - Director: 20% (60,000 shares)
 *   - Chairman: 40% (120,000 shares)
 *
 * @param percentage - Ownership percentage (0-100)
 * @param variant - Game variant ('standard' or 'extended')
 * @returns Ownership status: 'none', 'director', or 'chairman'
 */
export function getOwnershipStatus(
  percentage: number,
  variant: 'standard' | 'extended' = 'standard'
): OwnershipStatus {
  // Define thresholds based on variant
  const chairmanThreshold = variant === 'standard' ? 50 : 40;
  const directorThreshold = variant === 'standard' ? 25 : 20;

  if (percentage >= chairmanThreshold) {
    return 'chairman';
  }

  if (percentage >= directorThreshold) {
    return 'director';
  }

  return 'none';
}

/**
 * Get ownership status by share count
 *
 * @param playerShares - Number of shares owned
 * @param totalShares - Total shares for the stock (200,000 or 300,000)
 * @param variant - Game variant ('standard' or 'extended')
 * @returns Ownership status: 'none', 'director', or 'chairman'
 */
export function getOwnershipStatusByShares(
  playerShares: number,
  totalShares: number,
  variant: 'standard' | 'extended' = 'standard'
): OwnershipStatus {
  const percentage = calculateOwnership(playerShares, totalShares);
  return getOwnershipStatus(percentage, variant);
}

/**
 * Calculate the total value of stock holdings
 *
 * @param holdings - Object mapping stock names to number of shares owned
 * @param prices - Object mapping stock names to current prices
 * @returns Total value of all holdings
 */
export function calculateHoldingsValue(
  holdings: Record<string, number>,
  prices: Record<string, number>
): number {
  let totalValue = 0;

  for (const [stock, shares] of Object.entries(holdings)) {
    const price = prices[stock] || 0;
    totalValue += shares * price;
  }

  return totalValue;
}

/**
 * Calculate a player's total net worth
 *
 * Net Worth = Cash + Total Stock Value
 *
 * @param cash - Player's cash on hand
 * @param holdings - Object mapping stock names to number of shares owned
 * @param prices - Object mapping stock names to current prices
 * @returns Total net worth
 */
export function calculateNetWorth(
  cash: number,
  holdings: Record<string, number>,
  prices: Record<string, number>
): number {
  const holdingsValue = calculateHoldingsValue(holdings, prices);
  return cash + holdingsValue;
}

/**
 * Calculate the cost of a purchase
 *
 * @param quantity - Number of shares to purchase
 * @param pricePerShare - Price per share
 * @returns Total cost of the purchase
 */
export function calculatePurchaseCost(quantity: number, pricePerShare: number): number {
  return quantity * pricePerShare;
}

/**
 * Calculate the proceeds from a sale
 *
 * @param quantity - Number of shares to sell
 * @param pricePerShare - Price per share
 * @returns Total proceeds from the sale
 */
export function calculateSaleProceeds(quantity: number, pricePerShare: number): number {
  return quantity * pricePerShare;
}

/**
 * Calculate dividend payment for a player
 *
 * @param sharesOwned - Number of shares owned
 * @param dividendPerShare - Dividend amount per share
 * @returns Total dividend payment
 */
export function calculateDividendPayment(sharesOwned: number, dividendPerShare: number): number {
  return sharesOwned * dividendPerShare;
}

/**
 * Calculate the number of shares that can be purchased with Rights Issued
 *
 * Rights Issued: Buy 1 share for every 2 shares owned at $10/share
 *
 * @param sharesOwned - Number of shares currently owned
 * @returns Number of shares that can be purchased via Rights Issued
 */
export function calculateRightsIssuedShares(sharesOwned: number): number {
  return Math.floor(sharesOwned / 2);
}

/**
 * Calculate the cost of exercising Rights Issued
 *
 * @param sharesOwned - Number of shares currently owned
 * @returns Total cost to exercise all rights ($10 per eligible share)
 */
export function calculateRightsIssuedCost(sharesOwned: number): number {
  const eligibleShares = calculateRightsIssuedShares(sharesOwned);
  return eligibleShares * 10; // $10 per share
}

/**
 * Calculate debenture payout when a stock crashes to $0
 *
 * Debenture pays face value (starting price) for all shares owned
 *
 * @param sharesOwned - Number of shares owned
 * @param startingPrice - Original starting price of the stock
 * @returns Total debenture payout
 */
export function calculateDebenturePayout(sharesOwned: number, startingPrice: number): number {
  return sharesOwned * startingPrice;
}

/**
 * Calculate short position profit/loss
 *
 * Profit if price decreases, loss if price increases
 *
 * @param sharesShorted - Number of shares shorted
 * @param entryPrice - Price when short was opened
 * @param exitPrice - Current/settlement price
 * @returns Profit (positive) or loss (negative)
 */
export function calculateShortProfitLoss(
  sharesShorted: number,
  entryPrice: number,
  exitPrice: number
): number {
  const priceChange = entryPrice - exitPrice;
  return sharesShorted * priceChange;
}

/**
 * Calculate currency card effect on cash
 *
 * @param cash - Current cash amount
 * @param percentageChange - Percentage change (+10 or -10)
 * @returns New cash amount after applying percentage
 */
export function applyCurrencyCard(cash: number, percentageChange: number): number {
  const change = cash * (percentageChange / 100);
  return cash + change;
}

/**
 * Calculate options premium cost
 *
 * Premium = Strike Price × Number of Shares × Premium Rate
 * Default premium rate: 10%
 *
 * @param strikePrice - The strike price for the option
 * @param shares - Number of shares in the option contract
 * @param premiumRate - Premium rate as a percentage (default 10%)
 * @returns Total premium cost
 */
export function calculateOptionPremium(
  strikePrice: number,
  shares: number,
  premiumRate: number = 10
): number {
  return strikePrice * shares * (premiumRate / 100);
}

/**
 * Calculate call option profit/loss at expiration
 *
 * @param shares - Number of shares in contract
 * @param strikePrice - Strike price of the call
 * @param currentPrice - Current market price
 * @param premiumPaid - Premium paid upfront
 * @returns Net profit/loss (negative if loss)
 */
export function calculateCallOptionProfitLoss(
  shares: number,
  strikePrice: number,
  currentPrice: number,
  premiumPaid: number
): number {
  // If current price is above strike, exercise the option
  if (currentPrice > strikePrice) {
    const intrinsicValue = (currentPrice - strikePrice) * shares;
    return intrinsicValue - premiumPaid;
  }

  // Otherwise, don't exercise (only lose premium)
  return -premiumPaid;
}

/**
 * Calculate put option profit/loss at expiration
 *
 * @param shares - Number of shares in contract
 * @param strikePrice - Strike price of the put
 * @param currentPrice - Current market price
 * @param premiumPaid - Premium paid upfront
 * @returns Net profit/loss (negative if loss)
 */
export function calculatePutOptionProfitLoss(
  shares: number,
  strikePrice: number,
  currentPrice: number,
  premiumPaid: number
): number {
  // If current price is below strike, exercise the option
  if (currentPrice < strikePrice) {
    const intrinsicValue = (strikePrice - currentPrice) * shares;
    return intrinsicValue - premiumPaid;
  }

  // Otherwise, don't exercise (only lose premium)
  return -premiumPaid;
}

/**
 * Calculate new stock price after buyback
 *
 * Stock price increases by $5 per 10,000 shares bought back
 *
 * @param currentPrice - Current stock price
 * @param sharesBoughtBack - Number of shares bought back
 * @returns New stock price after buyback
 */
export function calculateBuybackPriceIncrease(
  currentPrice: number,
  sharesBoughtBack: number
): number {
  const priceIncreasePerTenThousand = 5;
  const increaseBlocks = Math.floor(sharesBoughtBack / 10000);
  const totalIncrease = increaseBlocks * priceIncreasePerTenThousand;

  return currentPrice + totalIncrease;
}

/**
 * Calculate new ownership percentage after buyback
 *
 * When shares are retired, total shares decrease, increasing everyone's percentage
 *
 * @param playerShares - Shares owned by the player (unchanged)
 * @param totalSharesBefore - Total shares before buyback
 * @param sharesBoughtBack - Number of shares retired in buyback
 * @returns New ownership percentage
 */
export function calculateOwnershipAfterBuyback(
  playerShares: number,
  totalSharesBefore: number,
  sharesBoughtBack: number
): number {
  const newTotalShares = totalSharesBefore - sharesBoughtBack;

  if (newTotalShares <= 0) {
    return 0;
  }

  return (playerShares / newTotalShares) * 100;
}
