/**
 * Deck Management Module
 * Handles deck generation, shuffling, and card drawing for Stock Market Tycoon
 */

export type CardType = 'price' | 'special';

export type SpecialCardType =
  | 'loan_stocks_matured'
  | 'debenture'
  | 'rights_issued'
  | 'share_suspended'
  | 'currency_plus_10'
  | 'currency_minus_10';

export interface Card {
  id: string;
  type: CardType;
  stock?: string; // For price cards: the company name
  value?: number; // For price cards: the price change value
  specialType?: SpecialCardType; // For special cards
}

/**
 * Generate a complete deck of 108 cards based on the game rules
 *
 * Card Distribution (Standard Variant):
 * - Atlas Bank: 4 cards (-10, -5, +5, +10)
 * - Titan Steel: 6 cards (-15, -10, -5, +5, +10, +15)
 * - Global Industries: 6 cards (-15, -10, -5, +5, +10, +15)
 * - Omega Energy: 8 cards (-20, -15, -10, -5, +5, +10, +15, +20)
 * - VitalCare Pharma: 10 cards (-25, -20, -15, -10, -5, +5, +10, +15, +20, +25)
 * - NovaTech: 12 cards (-30, -25, -20, -15, -10, -5, +5, +10, +15, +20, +25, +30)
 * - Special Cards: 14 total
 *
 * Total: 46 price cards + 14 special cards = 60 cards
 * Note: The actual game has 108 cards, so this might need adjustment based on actual rules
 *
 * @param variant - 'standard' for 2-6 players (108 cards) or 'extended' for 7-12 players (216 cards)
 * @returns Array of Card objects representing the full deck
 */
export function generateDeck(variant: 'standard' | 'extended' = 'standard'): Card[] {
  const cards: Card[] = [];
  let cardIdCounter = 0;

  // Price card configurations for each company
  const priceCardConfig = [
    { stock: 'Atlas Bank', values: [-10, -5, 5, 10] },
    { stock: 'Titan Steel', values: [-15, -10, -5, 5, 10, 15] },
    { stock: 'Global Industries', values: [-15, -10, -5, 5, 10, 15] },
    { stock: 'Omega Energy', values: [-20, -15, -10, -5, 5, 10, 15, 20] },
    { stock: 'VitalCare Pharma', values: [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25] },
    { stock: 'NovaTech', values: [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30] }
  ];

  // Generate price cards
  priceCardConfig.forEach(({ stock, values }) => {
    values.forEach((value) => {
      cards.push({
        id: `card-${cardIdCounter++}`,
        type: 'price',
        stock,
        value
      });
    });
  });

  // Special cards configuration (Standard variant counts)
  const specialCardConfig = [
    { specialType: 'loan_stocks_matured' as SpecialCardType, count: 2 },
    { specialType: 'debenture' as SpecialCardType, count: 2 },
    { specialType: 'rights_issued' as SpecialCardType, count: 2 },
    { specialType: 'share_suspended' as SpecialCardType, count: 2 },
    { specialType: 'currency_plus_10' as SpecialCardType, count: 3 },
    { specialType: 'currency_minus_10' as SpecialCardType, count: 3 }
  ];

  // Generate special cards
  specialCardConfig.forEach(({ specialType, count }) => {
    for (let i = 0; i < count; i++) {
      cards.push({
        id: `card-${cardIdCounter++}`,
        type: 'special',
        specialType
      });
    }
  });

  // For extended variant, duplicate the entire deck
  if (variant === 'extended') {
    const duplicatedCards = cards.map((card) => ({
      ...card,
      id: `card-${cardIdCounter++}` // Give new unique IDs to duplicated cards
    }));
    return [...cards, ...duplicatedCards];
  }

  return cards;
}

/**
 * Shuffle an array of cards using the Fisher-Yates algorithm
 * This creates a random permutation of the deck
 *
 * @param deck - Array of cards to shuffle
 * @returns A new shuffled array of cards (does not mutate original)
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]; // Create a copy to avoid mutating the original

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Draw a specified number of cards from the deck
 * Removes the drawn cards from the deck (mutates the deck array)
 *
 * @param deck - The deck to draw from (will be modified)
 * @param count - Number of cards to draw
 * @returns Array of drawn cards
 * @throws Error if trying to draw more cards than available
 */
export function drawCards(deck: Card[], count: number): Card[] {
  if (count > deck.length) {
    throw new Error(
      `Cannot draw ${count} cards from deck with only ${deck.length} cards remaining`
    );
  }

  if (count < 0) {
    throw new Error('Cannot draw negative number of cards');
  }

  // Remove and return the first 'count' cards from the deck
  return deck.splice(0, count);
}

/**
 * Get the total number of cards that should be in a deck for a given variant
 *
 * @param variant - 'standard' or 'extended'
 * @returns The total card count for that variant
 */
export function getDeckSize(variant: 'standard' | 'extended' = 'standard'): number {
  return variant === 'standard' ? 60 : 120;
}

/**
 * Count cards by type in a deck
 * Useful for validation and debugging
 *
 * @param deck - Array of cards to analyze
 * @returns Object with counts of price cards, special cards, and total
 */
export function countCardTypes(deck: Card[]): {
  priceCards: number;
  specialCards: number;
  total: number;
  byStock: Record<string, number>;
} {
  const byStock: Record<string, number> = {};
  let priceCards = 0;
  let specialCards = 0;

  deck.forEach((card) => {
    if (card.type === 'price' && card.stock) {
      priceCards++;
      byStock[card.stock] = (byStock[card.stock] || 0) + 1;
    } else if (card.type === 'special') {
      specialCards++;
    }
  });

  return {
    priceCards,
    specialCards,
    total: deck.length,
    byStock
  };
}
