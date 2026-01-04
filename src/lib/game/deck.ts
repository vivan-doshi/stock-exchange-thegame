import { Card, CardType, GameVariant } from '../../types';

// Constants from rules
const STOCK_IDS = [
  'atlas_bank',
  'titan_steel',
  'global_industries',
  'omega_energy',
  'vitalcare_pharma',
  'novatech'
] as const;

const PRICE_CARD_VALUES: Record<string, number[]> = {
  atlas_bank: [-10, -5, 5, 10],
  titan_steel: [-15, -10, -5, 5, 10, 15],
  global_industries: [-15, -10, -5, 5, 10, 15],
  omega_energy: [-20, -15, -10, -5, 5, 10, 15, 20],
  vitalcare_pharma: [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25],
  novatech: [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30]
};

const SPECIAL_CARDS: { type: CardType; count: number }[] = [
  { type: 'loan-stocks-matured', count: 2 },
  { type: 'debenture', count: 2 },
  { type: 'rights-issued', count: 2 },
  { type: 'share-suspended', count: 2 },
  { type: 'currency-plus', count: 3 },
  { type: 'currency-minus', count: 3 }
];

export function generateDeck(variant: GameVariant): Card[] {
  let deck: Card[] = [];

  // 1. Generate Price Cards
  STOCK_IDS.forEach(stockId => {
    const values = PRICE_CARD_VALUES[stockId];
    values.forEach(val => {
      deck.push({
        id: crypto.randomUUID(),
        type: 'price',
        companyId: stockId,
        value: val
      });
    });
  });

  // 2. Generate Special Cards
  SPECIAL_CARDS.forEach(special => {
    for (let i = 0; i < special.count; i++) {
      deck.push({
        id: crypto.randomUUID(),
        type: special.type
      });
    }
  });

  // 3. Handle Extended Variant (Double Deck)
  if (variant === 'extended') {
    // duplicating the deck with new IDs
    const duplicateDeck = deck.map(card => ({
      ...card,
      id: crypto.randomUUID()
    }));
    deck = [...deck, ...duplicateDeck];
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Distributes cards to players.
 * @param deck The shuffled deck of cards
 * @param playerCount The number of players to distribute to
 * @param cardsPerPlayer The number of cards to deal to each player (default: all)
 * @returns An array of hands (array of cards), where index corresponds to player index (0 to playerCount-1)
 */
export function distributeCards(deck: Card[], playerCount: number, cardsPerPlayer?: number): Card[][] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);

  const maxCards = cardsPerPlayer ? playerCount * cardsPerPlayer : deck.length;
  const limit = Math.min(deck.length, maxCards);

  for (let i = 0; i < limit; i++) {
    hands[i % playerCount].push(deck[i]);
  }

  return hands;
}
