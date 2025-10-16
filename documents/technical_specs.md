# Stock Market Tycoon - Technical Specifications

Technical architecture, database design, and implementation guidelines for the webapp with support for both Standard (2-6 players) and Extended (7-12 players) variants.

---

## Tech Stack Recommendations

### Frontend
**Recommended:** React + TypeScript
- Component-based architecture perfect for game states
- TypeScript for type safety (money calculations critical)
- Large ecosystem of UI libraries
- Good mobile support

**Alternatives:**
- Vue.js (simpler learning curve)
- Svelte (better performance)

### Backend
**Recommended:** Node.js + Express
- JavaScript ecosystem consistency
- Real-time capabilities (Socket.io for multiplayer)
- Easy API development
- Good scalability

**Alternatives:**
- Python + FastAPI (if team prefers Python)
- Go (better performance for scaling)

### Database
**Recommended:** PostgreSQL
- ACID compliance (important for money transactions)
- Complex queries for game statistics
- Reliable and battle-tested

**For Prototyping:** SQLite or Firebase
**For Real-Time:** Redis (game state caching)

### Hosting
**Recommended:** Vercel/Netlify (frontend) + Railway/Render (backend)
- Easy deployment
- Good free tiers for MVP
- Scales well

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    
    -- Game Stats
    games_played_trader INTEGER DEFAULT 0,
    games_played_investor INTEGER DEFAULT 0,
    games_played_strategist INTEGER DEFAULT 0,
    
    games_won_trader INTEGER DEFAULT 0,
    games_won_investor INTEGER DEFAULT 0,
    games_won_strategist INTEGER DEFAULT 0,
    
    highest_net_worth INTEGER DEFAULT 0,
    
    -- Unlocks
    investor_unlocked BOOLEAN DEFAULT FALSE,
    strategist_unlocked BOOLEAN DEFAULT FALSE,
    
    -- Preferences
    preferred_mode VARCHAR(20) DEFAULT 'trader',
    preferred_variant VARCHAR(20) DEFAULT 'standard', -- 'standard' or 'extended'
    avatar_url VARCHAR(255),
    sound_enabled BOOLEAN DEFAULT TRUE,
    animations_enabled BOOLEAN DEFAULT TRUE
);
```

### Games Table
```sql
CREATE TABLE games (
    game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_mode VARCHAR(20) NOT NULL, -- 'trader', 'investor', 'strategist'
    game_variant VARCHAR(20) NOT NULL, -- 'standard' (2-6), 'extended' (7-12)
    status VARCHAR(20) NOT NULL, -- 'waiting', 'in_progress', 'completed', 'abandoned'
    
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    current_round INTEGER DEFAULT 1,
    current_transaction INTEGER DEFAULT 1,
    dealer_position INTEGER,
    
    -- Settings
    player_count INTEGER NOT NULL,
    rounds_total INTEGER DEFAULT 10,
    
    -- Variant-specific settings
    starting_capital INTEGER, -- 600000 for standard, 450000 for extended
    max_shares_per_stock INTEGER, -- 200000 for standard, 300000 for extended
    director_threshold INTEGER, -- 50000 for standard, 60000 for extended
    chairman_threshold INTEGER, -- 100000 for standard, 120000 for extended
    deck_multiplier INTEGER, -- 1 for standard, 2 for extended
    
    winner_user_id UUID REFERENCES users(user_id),
    
    -- Game State (JSON for flexibility)
    stock_prices JSONB, -- Current prices for all 6 stocks
    share_supply JSONB, -- Available shares per stock (affected by buybacks)
    options_available JSONB -- Options contracts in play (Strategist mode)
);
```

### Players Table (Game Participants)
```sql
CREATE TABLE game_players (
    player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id),
    
    player_position INTEGER NOT NULL, -- Turn order (1-12 for extended)
    
    -- Current State
    cash_balance INTEGER NOT NULL, -- 600000 or 450000 depending on variant
    net_worth INTEGER,
    is_bankrupt BOOLEAN DEFAULT FALSE,
    
    -- Holdings (JSON)
    stock_holdings JSONB, -- {atlas_bank: 5000, titan_steel: 3000, ...}
    short_positions JSONB, -- Investor mode: {omega_energy: 10000, ...}
    option_positions JSONB, -- Strategist mode: [{type: 'call', stock: 'novatech', ...}]
    
    -- Cards in hand
    current_cards JSONB, -- Cards for current round
    
    -- Final Results
    final_rank INTEGER,
    final_net_worth INTEGER
);
```

### Stock Prices History
```sql
CREATE TABLE stock_price_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    
    -- Prices at end of round
    atlas_bank INTEGER,
    titan_steel INTEGER,
    global_industries INTEGER,
    omega_energy INTEGER,
    vitalcare_pharma INTEGER,
    novatech INTEGER,
    
    recorded_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Log
```sql
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
    player_id UUID REFERENCES game_players(player_id) ON DELETE CASCADE,
    
    round_number INTEGER NOT NULL,
    transaction_number INTEGER NOT NULL, -- 1, 2, or 3
    
    transaction_type VARCHAR(50) NOT NULL,
    -- 'buy_shares', 'sell_shares', 'short_shares', 'buy_option',
    -- 'issue_dividend', 'announce_buyback', 'use_special_card'
    
    stock_symbol VARCHAR(50),
    quantity INTEGER,
    price_per_share INTEGER,
    total_amount INTEGER,
    
    details JSONB, -- Flexible for special card effects, option details, etc.
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Game Variants Table (Configuration)
```sql
CREATE TABLE game_variants (
    variant_name VARCHAR(20) PRIMARY KEY, -- 'standard' or 'extended'
    display_name VARCHAR(50),
    description TEXT,
    
    min_players INTEGER,
    max_players INTEGER,
    
    starting_capital INTEGER,
    max_shares_per_stock INTEGER,
    director_threshold_shares INTEGER,
    director_threshold_percent DECIMAL(5,2),
    chairman_threshold_shares INTEGER,
    chairman_threshold_percent DECIMAL(5,2),
    
    deck_multiplier INTEGER,
    cards_per_player_approx INTEGER,
    
    options_limit_per_stock INTEGER, -- Strategist mode
    
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default variants
INSERT INTO game_variants VALUES
('standard', 'Standard (2-6 Players)', 'Traditional gameplay with original rules', 
 2, 6, 600000, 200000, 50000, 25.00, 100000, 50.00, 1, 10, 40000, TRUE),
('extended', 'Extended (7-12 Players)', 'Large group variant with adjusted thresholds',
 7, 12, 450000, 300000, 60000, 20.00, 120000, 40.00, 2, 9, 60000, TRUE);
```

### Achievements Table
```sql
CREATE TABLE achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    mode VARCHAR(20), -- Which mode this applies to
    variant VARCHAR(20), -- NULL = applies to both, 'standard', 'extended'
    icon_url VARCHAR(255),
    rarity VARCHAR(20) -- 'common', 'rare', 'epic', 'legendary'
);

CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### User Management
```
GET    /api/users/:userId
PATCH  /api/users/:userId
GET    /api/users/:userId/stats
GET    /api/users/:userId/achievements
PATCH  /api/users/:userId/preferences  -- Set preferred variant
```

### Game Lobby
```
POST   /api/games/create                -- Specify variant in body
GET    /api/games/available              -- Filter by variant
POST   /api/games/:gameId/join
DELETE /api/games/:gameId/leave
POST   /api/games/:gameId/start
GET    /api/games/variants               -- Get available variants and their rules
```

### Game Actions
```
GET    /api/games/:gameId/state
POST   /api/games/:gameId/actions/buy
POST   /api/games/:gameId/actions/sell
POST   /api/games/:gameId/actions/short          (Investor+)
POST   /api/games/:gameId/actions/buy-option     (Strategist)
POST   /api/games/:gameId/actions/issue-dividend (Strategist)
POST   /api/games/:gameId/actions/buyback        (Strategist)
POST   /api/games/:gameId/actions/use-card
POST   /api/games/:gameId/actions/end-turn
```

### Game Management
```
GET    /api/games/:gameId/history
GET    /api/games/:gameId/players
POST   /api/games/:gameId/end-round
GET    /api/games/:gameId/variant        -- Get current game's variant rules
```

### Leaderboards
```
GET    /api/leaderboard/global?variant=standard|extended
GET    /api/leaderboard/friends?variant=standard|extended
GET    /api/leaderboard/weekly?variant=standard|extended
```

---

## Game State Management

### Core Game State Object
```typescript
interface GameState {
  gameId: string;
  mode: 'trader' | 'investor' | 'strategist';
  variant: 'standard' | 'extended';
  variantConfig: VariantConfig;
  status: 'waiting' | 'in_progress' | 'completed';
  
  currentRound: number;
  currentTransaction: number;
  dealerPosition: number;
  
  players: Player[];
  stockPrices: StockPrices;
  shareSupply: ShareSupply; // Affected by buybacks
  
  // Deck state
  remainingCards: Card[];
  discardedCards: Card[];
  
  // Mode-specific
  optionsMarket?: OptionContract[]; // Strategist mode
  
  // History
  priceHistory: PriceHistoryEntry[];
  transactionLog: Transaction[];
}

interface VariantConfig {
  name: 'standard' | 'extended';
  minPlayers: number;
  maxPlayers: number;
  startingCapital: number;          // 600000 or 450000
  maxSharesPerStock: number;        // 200000 or 300000
  directorThresholdShares: number;  // 50000 or 60000
  directorThresholdPercent: number; // 25 or 20
  chairmanThresholdShares: number;  // 100000 or 120000
  chairmanThresholdPercent: number; // 50 or 40
  deckMultiplier: number;           // 1 or 2
  optionsLimitPerStock: number;     // 40000 or 60000
}

interface Player {
  playerId: string;
  userId: string;
  username: string;
  position: number; // Turn order (1-6 standard, 1-12 extended)
  
  cashBalance: number;
  stockHoldings: { [stock: string]: number };
  shortPositions?: { [stock: string]: number }; // Investor+
  optionPositions?: OptionContract[]; // Strategist
  
  currentCards: Card[];
  
  // Ownership status (calculated based on variant)
  directorOf: string[]; // Stock symbols
  chairmanOf: string[]; // Stock symbols
  
  isBankrupt: boolean;
  netWorth: number;
}

interface StockPrices {
  atlas_bank: number;
  titan_steel: number;
  global_industries: number;
  omega_energy: number;
  vitalcare_pharma: number;
  novatech: number;
}

interface Card {
  cardId: string;
  stock: string;
  value: number; // Price change: -30 to +30
  type: 'price' | 'special';
  specialType?: 'loan' | 'debenture' | 'rights' | 'suspended' | 'currency_plus' | 'currency_minus';
  deckNumber?: number; // 1 or 2 (for extended variant tracking)
}
```

---

## Key Algorithms

### 1. Buy Condition Validator
```typescript
function canBuyStock(
  player: Player,
  stock: string,
  gameState: GameState
): boolean {
  // Exception: First buyer of the round
  const isFirstBuyer = !gameState.transactionLog.some(
    t => t.roundNumber === gameState.currentRound && 
         t.stock === stock && 
         t.type === 'buy'
  );
  
  if (isFirstBuyer) return true;
  
  // Normal condition: Cards must sum to >= 0
  const playerCards = player.currentCards.filter(c => c.stock === stock);
  const cardSum = playerCards.reduce((sum, card) => sum + card.value, 0);
  
  return cardSum >= 0;
}
```

### 2. Director/Chairman Calculator (Variant-Aware)
```typescript
function updateOwnershipStatus(gameState: GameState): void {
  const stocks = ['atlas_bank', 'titan_steel', 'global_industries', 
                  'omega_energy', 'vitalcare_pharma', 'novatech'];
  
  const config = gameState.variantConfig;
  
  stocks.forEach(stock => {
    const totalShares = gameState.shareSupply[stock];
    const ownership = gameState.players.map(p => ({
      playerId: p.playerId,
      shares: p.stockHoldings[stock] || 0,
      percentage: ((p.stockHoldings[stock] || 0) / totalShares) * 100
    })).sort((a, b) => b.shares - a.shares);
    
    // Reset status
    gameState.players.forEach(p => {
      p.chairmanOf = p.chairmanOf.filter(s => s !== stock);
      p.directorOf = p.directorOf.filter(s => s !== stock);
    });
    
    // Assign Chairman (threshold based on variant)
    const topOwner = ownership[0];
    if (topOwner.shares >= config.chairmanThresholdShares) {
      const player = gameState.players.find(p => p.playerId === topOwner.playerId);
      player.chairmanOf.push(stock);
    }
    
    // Assign Director (threshold based on variant, but not Chairman)
    ownership.forEach(owner => {
      if (owner.shares >= config.directorThresholdShares && 
          owner.shares < config.chairmanThresholdShares) {
        const player = gameState.players.find(p => p.playerId === owner.playerId);
        if (!player.chairmanOf.includes(stock)) {
          player.directorOf.push(stock);
        }
      }
    });
  });
}
```

### 3. Deck Initialization (Variant-Aware)
```typescript
function initializeDeck(variant: 'standard' | 'extended'): Card[] {
  const baseDeck: Card[] = [];
  
  // Price cards
  const priceCardDefinitions = [
    { stock: 'atlas_bank', values: [-10, -5, 5, 10] },
    { stock: 'titan_steel', values: [-15, -10, -5, 5, 10, 15] },
    { stock: 'global_industries', values: [-15, -10, -5, 5, 10, 15] },
    { stock: 'omega_energy', values: [-20, -15, -10, -5, 5, 10, 15, 20] },
    { stock: 'vitalcare_pharma', values: [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25] },
    { stock: 'novatech', values: [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30] }
  ];
  
  priceCardDefinitions.forEach(def => {
    def.values.forEach(value => {
      baseDeck.push({
        cardId: generateCardId(),
        stock: def.stock,
        value: value,
        type: 'price',
        deckNumber: 1
      });
    });
  });
  
  // Special cards
  const specialCards = [
    { type: 'loan', count: 2 },
    { type: 'debenture', count: 2 },
    { type: 'rights', count: 2 },
    { type: 'suspended', count: 2 },
    { type: 'currency_plus', count: 3 },
    { type: 'currency_minus', count: 3 }
  ];
  
  specialCards.forEach(special => {
    for (let i = 0; i < special.count; i++) {
      baseDeck.push({
        cardId: generateCardId(),
        stock: 'special',
        value: 0,
        type: 'special',
        specialType: special.type,
        deckNumber: 1
      });
    }
  });
  
  // For extended variant, duplicate the deck
  if (variant === 'extended') {
    const duplicateDeck = baseDeck.map(card => ({
      ...card,
      cardId: generateCardId(),
      deckNumber: 2
    }));
    return shuffle([...baseDeck, ...duplicateDeck]);
  }
  
  return shuffle(baseDeck);
}
```

### 4. Option Limits Validator (Variant-Aware)
```typescript
function canBuyOption(
  stock: string,
  quantity: number,
  gameState: GameState
): { canBuy: boolean; reason?: string } {
  const config = gameState.variantConfig;
  
  // Calculate current options outstanding
  const currentOptions = gameState.players.reduce((total, player) => {
    if (!player.optionPositions) return total;
    return total + player.optionPositions
      .filter(opt => opt.stock === stock)
      .reduce((sum, opt) => sum + opt.quantity, 0);
  }, 0);
  
  const maxOptions = config.optionsLimitPerStock; // 40k or 60k
  
  if (currentOptions + quantity > maxOptions) {
    return {
      canBuy: false,
      reason: `Maximum ${maxOptions} shares can be under options for ${stock}. Current: ${currentOptions}`
    };
  }
  
  return { canBuy: true };
}
```

---

## UI/UX Considerations

### Critical UI Elements

1. **Variant Selection (Lobby)**
   - Prominent toggle: "Standard (2-6 Players)" vs "Extended (7-12 Players)"
   - Show key differences in tooltip:
     - Starting capital
     - Ownership thresholds
     - Deck size
   - Visual indicators for which variant is active

2. **Stock Price Board**
   - Real-time prices
   - Price change indicators (↑↓)
   - Volatility indicator
   - **Variant-aware:** Show max shares available (200k vs 300k)

3. **Player Portfolio Panel**
   - Cash balance (large, prominent)
   - Stock holdings (grid/list)
   - Net worth (calculated, updated)
   - **Variant-aware:** Ownership badges with thresholds
     - Standard: "Director (25%)" / "Chairman (50%)"
     - Extended: "Director (20%)" / "Chairman (40%)"

4. **Ownership Progress Indicator**
   - Visual progress bar showing % ownership
   - Clearly mark Director and Chairman thresholds
   - Different colors for Standard vs Extended
   - Show exact share count needed

5. **Game Info Panel**
   - Display current variant prominently
   - Show variant-specific rules:
     - "Director: 60,000 shares (20%)"
     - "Chairman: 120,000 shares (40%)"
     - "Starting Capital: $450,000"

---

## Testing Strategy

### Unit Tests
- Buy condition logic
- Price calculation
- Net worth calculation
- **Variant-specific:** Ownership status updates for both variants
- Card dealing algorithm (1x and 2x decks)

### Integration Tests
- Complete game flow (10 rounds) in Standard variant
- Complete game flow (10 rounds) in Extended variant
- 6-player Standard game
- 12-player Extended game
- Mode unlocks
- Achievement triggers

### Load Tests
- 100+ concurrent games (mixed variants)
- Database query performance
- WebSocket connection stability
- **Critical:** Test with 12 simultaneous players in Extended variant

### Balance Tests
- Extended variant with 12 players - achievability of control
- Starting capital appropriateness ($450k vs $600k)
- Share availability (300k sufficient?)
- Options limits (60k appropriate?)

---

## Performance Considerations

### Optimization Targets
- **Game state updates:** < 100ms
- **Action validation:** < 50ms
- **Database queries:** < 200ms
- **WebSocket latency:** < 150ms
- **Extended variant:** Handle 12 players with same performance

### Caching Strategy
- Game state in Redis (active games)
- Variant configurations (rarely change)
- Stock prices (frequently accessed)
- User stats (read-heavy)
- Leaderboards by variant (updated periodically)

### Extended Variant Specific
- More players = larger game state
- Optimize Player array operations
- Consider pagination for transaction logs (more transactions)
- Efficient card dealing with 2x deck

---

## Security Considerations

### Critical Security Measures
1. **Validate all actions server-side** - Never trust client
2. **Variant validation:**
   - Ensure player count matches variant
   - Verify starting capital matches variant
   - Check ownership thresholds match variant
3. **Prevent cheating:**
   - Can't see other players' cards
   - Can't take actions out of turn
   - Can't modify cash/holdings directly
   - Can't change variant mid-game
4. **Rate limiting** on API endpoints
5. **Input sanitization** for usernames, chat

---

## Migration Strategy for Existing Users

If launching Extended variant after Standard is live:

```sql
-- Add variant columns to existing games table
ALTER TABLE games ADD COLUMN game_variant VARCHAR(20) DEFAULT 'standard';
ALTER TABLE games ADD COLUMN starting_capital INTEGER DEFAULT 600000;
ALTER TABLE games ADD COLUMN max_shares_per_stock INTEGER DEFAULT 200000;
ALTER TABLE games ADD COLUMN director_threshold INTEGER DEFAULT 50000;
ALTER TABLE games ADD COLUMN chairman_threshold INTEGER DEFAULT 100000;
ALTER TABLE games ADD COLUMN deck_multiplier INTEGER DEFAULT 1;

-- Update user preferences
ALTER TABLE users ADD COLUMN preferred_variant VARCHAR(20) DEFAULT 'standard';

-- Backfill existing games as 'standard' variant
UPDATE games SET game_variant = 'standard' WHERE game_variant IS NULL;
```

---

## Deployment Checklist

### Pre-Launch (Both Variants)
- [ ] Both variants fully functional
- [ ] Variant selection working in lobby
- [ ] Ownership calculations correct for both variants
- [ ] Mobile responsive
- [ ] Tutorial system covers both variants
- [ ] Achievement system working
- [ ] Leaderboards separate by variant
- [ ] Performance tested (6 and 12 players)
- [ ] Security audit
- [ ] Beta testing completed for both variants

---

*Technical Specifications for Stock Market Tycoon with Standard and Extended variants. This is a living document and will be updated as development progresses.*