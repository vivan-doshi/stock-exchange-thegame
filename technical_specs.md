# Stock Market Tycoon - Technical Specifications

Technical architecture, database design, and implementation guidelines for the webapp.

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
    
    winner_user_id UUID REFERENCES users(user_id),
    
    -- Game State (JSON for flexibility)
    stock_prices JSONB, -- Current prices for all 6 stocks
    share_supply JSONB, -- Available shares per stock (for buybacks)
    options_available JSONB -- Options contracts in play (Strategist mode)
);
```

### Players Table (Game Participants)
```sql
CREATE TABLE game_players (
    player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id),
    
    player_position INTEGER NOT NULL, -- Turn order (1-6)
    
    -- Current State
    cash_balance INTEGER NOT NULL DEFAULT 600000,
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

### Achievements Table
```sql
CREATE TABLE achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    mode VARCHAR(20), -- Which mode this applies to
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

### Leaderboards (Materialized View)
```sql
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    user_id,
    username,
    games_won_trader + games_won_investor + games_won_strategist as total_wins,
    highest_net_worth,
    games_played_trader + games_played_investor + games_played_strategist as total_games
FROM users
ORDER BY total_wins DESC, highest_net_worth DESC
LIMIT 100;

-- Refresh periodically
REFRESH MATERIALIZED VIEW leaderboard;
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
```

### Game Lobby
```
POST   /api/games/create
GET    /api/games/available
POST   /api/games/:gameId/join
DELETE /api/games/:gameId/leave
POST   /api/games/:gameId/start
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
```

### Leaderboards
```
GET    /api/leaderboard/global
GET    /api/leaderboard/friends
GET    /api/leaderboard/weekly
```

---

## Game State Management

### Core Game State Object
```typescript
interface GameState {
  gameId: string;
  mode: 'trader' | 'investor' | 'strategist';
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

interface Player {
  playerId: string;
  userId: string;
  username: string;
  position: number; // Turn order
  
  cashBalance: number;
  stockHoldings: { [stock: string]: number };
  shortPositions?: { [stock: string]: number }; // Investor+
  optionPositions?: OptionContract[]; // Strategist
  
  currentCards: Card[];
  
  // Ownership status
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

### 2. Director/Chairman Calculator
```typescript
function updateOwnershipStatus(gameState: GameState): void {
  const stocks = ['atlas_bank', 'titan_steel', 'global_industries', 
                  'omega_energy', 'vitalcare_pharma', 'novatech'];
  
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
    
    // Assign Chairman (50%+)
    const topOwner = ownership[0];
    if (topOwner.percentage >= 50) {
      const player = gameState.players.find(p => p.playerId === topOwner.playerId);
      player.chairmanOf.push(stock);
    }
    
    // Assign Director (25%+, but not Chairman)
    ownership.forEach(owner => {
      if (owner.percentage >= 25 && owner.percentage < 50) {
        const player = gameState.players.find(p => p.playerId === owner.playerId);
        if (!player.chairmanOf.includes(stock)) {
          player.directorOf.push(stock);
        }
      }
    });
  });
}
```

### 3. End of Round Price Calculation
```typescript
function calculateNewPrices(gameState: GameState): void {
  const stocks = Object.keys(gameState.stockPrices);
  
  stocks.forEach(stock => {
    let priceChange = 0;
    
    // Collect all revealed cards for this stock
    const allCards = gameState.players.flatMap(p => 
      p.currentCards.filter(c => c.stock === stock && c.type === 'price')
    );
    
    // Check for card suppressions (Director/Chairman powers)
    // This is handled in a separate phase
    
    // Sum up price changes
    priceChange = allCards.reduce((sum, card) => sum + card.value, 0);
    
    // Apply Share Suspended cards
    const suspendedCards = gameState.players.flatMap(p =>
      p.currentCards.filter(c => c.specialType === 'suspended' && c.stock === stock)
    );
    
    if (suspendedCards.length > 0) {
      // Reset to last round's price (suspend overrides everything)
      const lastRoundPrice = gameState.priceHistory[gameState.currentRound - 2];
      gameState.stockPrices[stock] = lastRoundPrice[stock];
    } else {
      // Apply normal price change
      gameState.stockPrices[stock] = Math.max(0, gameState.stockPrices[stock] + priceChange);
    }
  });
}
```

### 4. Net Worth Calculator
```typescript
function calculateNetWorth(player: Player, stockPrices: StockPrices): number {
  let netWorth = player.cashBalance;
  
  // Add stock holdings value
  Object.entries(player.stockHoldings).forEach(([stock, shares]) => {
    netWorth += shares * stockPrices[stock];
  });
  
  // Subtract short liabilities (Investor mode)
  if (player.shortPositions) {
    Object.entries(player.shortPositions).forEach(([stock, shares]) => {
      // Short liability = shares * current_price
      netWorth -= shares * stockPrices[stock];
    });
  }
  
  // Add option values (Strategist mode) - simplified
  if (player.optionPositions) {
    player.optionPositions.forEach(option => {
      const currentPrice = stockPrices[option.stock];
      const strikePrice = option.strikePrice;
      
      if (option.type === 'call' && currentPrice > strikePrice) {
        netWorth += (currentPrice - strikePrice) * option.quantity;
      } else if (option.type === 'put' && currentPrice < strikePrice) {
        netWorth += (strikePrice - currentPrice) * option.quantity;
      }
      // If option is out of money, it contributes 0 (already paid premium)
    });
  }
  
  return netWorth;
}
```

---

## Real-Time Multiplayer

### WebSocket Events

**Client → Server:**
```
join_game
leave_game
ready_up
take_action (buy, sell, etc.)
chat_message
```

**Server → Client:**
```
game_state_update
player_joined
player_left
turn_started
action_taken
round_ended
game_ended
chat_message
error
```

### Event Flow Example
```
1. Player A clicks "Buy 5000 Titan Steel"
   ↓
2. Client sends: take_action {type: 'buy', stock: 'titan_steel', quantity: 5000}
   ↓
3. Server validates action
   ↓
4. Server updates game state
   ↓
5. Server broadcasts: action_taken {player: 'Player A', action: 'bought 5000 Titan Steel for $125,000'}
   ↓
6. All clients update UI
```

---

## UI/UX Considerations

### Critical UI Elements

1. **Stock Price Board**
   - Real-time prices
   - Price change indicators (↑↓)
   - Volatility indicator

2. **Player Portfolio Panel**
   - Cash balance (large, prominent)
   - Stock holdings (grid/list)
   - Net worth (calculated, updated)
   - Ownership badges (Director/Chairman)

3. **Card Hand**
   - Current cards displayed
   - Groupable by stock
   - Sum calculator per stock

4. **Action Panel**
   - Buy/Sell buttons
   - Quantity selector
   - Mode-specific actions (Short, Options, etc.)
   - Validation feedback

5. **Transaction Log**
   - Recent actions
   - Price changes
   - Special events

6. **Game Progress**
   - Round indicator (1/10)
   - Transaction indicator (1/3)
   - Turn indicator (whose turn)

### Mobile Responsive
- Stack panels vertically on mobile
- Swipe gestures for cards
- Bottom sheet for actions
- Simplified transaction log

---

## Testing Strategy

### Unit Tests
- Buy condition logic
- Price calculation
- Net worth calculation
- Ownership status updates
- Card dealing algorithm

### Integration Tests
- Complete game flow (10 rounds)
- Multiplayer interactions
- Mode unlocks
- Achievement triggers

### Load Tests
- 100+ concurrent games
- Database query performance
- WebSocket connection stability

---

## Performance Considerations

### Optimization Targets
- **Game state updates:** < 100ms
- **Action validation:** < 50ms
- **Database queries:** < 200ms
- **WebSocket latency:** < 150ms

### Caching Strategy
- Game state in Redis (active games)
- Stock prices (frequently accessed)
- User stats (read-heavy)
- Leaderboards (updated periodically)

---

## Security Considerations

### Critical Security Measures
1. **Validate all actions server-side** - Never trust client
2. **Prevent cheating:**
   - Can't see other players' cards
   - Can't take actions out of turn
   - Can't modify cash/holdings directly
3. **Rate limiting** on API endpoints
4. **Input sanitization** for usernames, chat
5. **HTTPS only** for production
6. **Secure password hashing** (bcrypt)

---

## Deployment Checklist

### Pre-Launch
- [ ] All three modes fully functional
- [ ] Mobile responsive
- [ ] Tutorial system complete
- [ ] Achievement system working
- [ ] Leaderboards functional
- [ ] Performance tested
- [ ] Security audit
- [ ] Beta testing completed

### Launch Day
- [ ] Monitoring in place
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics / Mixpanel)
- [ ] Database backups automated
- [ ] Customer support ready

---

*Technical Specifications for Stock Market Tycoon. This is a living document and will be updated as development progresses.*