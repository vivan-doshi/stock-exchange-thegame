# Stock Market Tycoon - Claude Code Context

This document provides complete context for building Stock Market Tycoon, a web-based stock market simulation game.

---

## GAME OVERVIEW

Stock Market Tycoon is a 2-6 player stock market simulation game where players buy and sell shares in 6 fictional companies over 10 rounds. The player with the highest net worth at the end wins.

**Core Specs:**
- Starting capital: $600,000 per player
- 10 rounds (market years)
- 3 transactions per round
- 6 companies with different volatility levels
- Turn-based gameplay with real-time multiplayer

---

## THE SIX COMPANIES

| Stock | Sector | Starting Price | Max Shares | Volatility |
|-------|--------|----------------|------------|------------|
| Atlas Bank | Banking | $20 | 200,000 | Low (4 cards) |
| Titan Steel | Manufacturing | $25 | 200,000 | Medium-Low (6 cards) |
| Global Industries | Conglomerate | $45 | 200,000 | Medium (6 cards) |
| Omega Energy | Energy | $55 | 200,000 | Medium-High (8 cards) |
| VitalCare Pharma | Healthcare | $75 | 200,000 | High (10 cards) |
| NovaTech | Technology | $80 | 200,000 | Very High (12 cards) |

---

## GAME MODES (PROGRESSIVE UNLOCKING)

### MODE 1: TRADER MODE (Always Unlocked)
**Includes:**
- Basic buying and selling
- Special cards (6 types)
- Director/Chairman powers
- Turn-based play

**Unlock:** Available immediately

### MODE 2: INVESTOR MODE
**Adds:**
- Shorting mechanics (bet against stocks)
- Bankruptcy risk
- Maximum 12,000 shares shorted per stock

**Unlock:** Complete 3 Trader Mode games

### MODE 3: STRATEGIST MODE
**Adds:**
- Options trading (calls and puts)
- Dividends (Director power)
- Stock buybacks (Chairman power)

**Unlock:** Win 2 Investor Mode games

---

## CORE GAME RULES

### BUYING STOCKS
**Rules:**
1. Minimum purchase: 1,000 shares OR $5,000 (whichever is higher)
2. Buy condition: Sum of cards drawn must be >= 0
3. Exception: First buyer of a stock can buy regardless of cards
4. Must have enough cash
5. Must have shares available in market

**Example:**
- Player draws cards: -10, +5, +15
- Sum = +10 (positive, can buy)
- Player draws: -20, -10, +5
- Sum = -25 (negative, cannot buy unless first buyer)

### SELLING STOCKS
**Rules:**
1. Can sell any amount of shares you own
2. Sell at current market price
3. No restrictions on selling

### STOCK PRICE CALCULATION
**Each transaction:**
1. Active player draws 3 cards
2. Cards are revealed to all players
3. If buying: Cards sum determines if purchase valid
4. After transaction: Sum of cards adjusts stock price
5. Price cannot go below $0

**Example:**
- Current price: $50
- Cards drawn: -10, +5, +20
- New price: $50 + (-10 + 5 + 20) = $65

---

## SPECIAL CARDS (6 Types)

### 1. LOAN STOCKS MATURED
**Effect:** Player receives $100,000 from bank immediately
**Timing:** When drawn
**Count:** 3 cards in deck

### 2. DEBENTURE
**Effect:** If stock hits $0, holder receives face value
**Face values:** $25,000 / $50,000 / $100,000
**Timing:** Held until stock hits $0 or game ends
**Count:** 3 cards in deck

### 3. RIGHTS ISSUED
**Effect:** Option to buy shares at $10 each (1:2 ratio)
**Example:** Own 10,000 shares, can buy 5,000 more at $10 each
**Timing:** Immediately when drawn
**Count:** 3 cards in deck

### 4. SHARE SUSPENDED
**Effect:** Stock price resets to previous round's price
**Timing:** Immediately when drawn
**Count:** 2 cards in deck

### 5. CURRENCY +10%
**Effect:** Add 10% to your cash
**Timing:** End of round (after all transactions)
**Count:** 2 cards in deck

### 6. CURRENCY -10%
**Effect:** Subtract 10% from your cash
**Timing:** End of round (after all transactions)
**Count:** 1 card in deck

---

## OWNERSHIP POWERS

### DIRECTOR STATUS
**Requirement:** Own 25% or more of a company (50,000+ shares)
**Power:** Remove 1 of YOUR OWN cards from price calculation once per transaction
**Strategic use:** Remove negative cards to prevent price drops

### CHAIRMAN STATUS
**Requirement:** Own 50% or more of a company (100,000+ shares)
**Power:** Remove ANY player's card from price calculation once per transaction
**Strategic use:** Remove positive cards from opponents, negative from yourself

---

## INVESTOR MODE: SHORTING RULES

**What is shorting:** Betting that a stock price will decrease

**How it works:**
1. Use 1 transaction to open short position
2. Select stock and quantity (1,000 - 12,000 shares)
3. At end of round, position settles:
   - Stock decreased: Bank pays you the difference x shares
   - Stock increased: You pay bank the difference x shares

**Restrictions:**
1. Cannot short stocks you currently own
2. Maximum 12,000 shares shorted per stock (across ALL players)
3. Must have cash to cover potential losses
4. Can cause bankruptcy if losses exceed cash

**Example:**
- Short 5,000 shares of NovaTech at $80
- Round ends, price drops to $60
- Profit: (80 - 60) x 5,000 = $100,000
- Bank pays you $100,000

**Example (Loss):**
- Short 5,000 shares of NovaTech at $80
- Round ends, price rises to $100
- Loss: (100 - 80) x 5,000 = $100,000
- You pay bank $100,000

---

## STRATEGIST MODE: ADVANCED MECHANICS

### OPTIONS TRADING

**CALL OPTION:**
- Right to BUY shares at strike price
- Pay premium: 5% of strike price per share
- Profitable if stock price > strike price + premium
- Expires end of current round

**PUT OPTION:**
- Right to SELL shares at strike price
- Pay premium: 5% of strike price per share
- Profitable if stock price < strike price - premium
- Expires end of current round

**Rules:**
- Can only buy options, not sell them
- Maximum 40,000 shares in options per stock (20% cap)
- Can exercise anytime before expiration if profitable
- Auto-expire if not exercised

**Example (Call):**
- Buy call option: 10,000 shares at $50 strike
- Premium: $50 x 0.05 = $2.50 per share
- Total cost: $2.50 x 10,000 = $25,000
- Stock rises to $70
- Exercise: Buy 10,000 at $50, immediately worth $70
- Profit: ($70 - $50) x 10,000 - $25,000 = $175,000

### DIVIDENDS

**Who can use:** Director only (25%+ ownership)
**Effect:** Pay $1-5 per share to ALL shareholders
**Frequency:** Once per round
**Impact:** Reduces stock price by dividend amount

**Example:**
- You are Director of Atlas Bank
- Issue $2 dividend per share
- Total shares: 200,000
- Total payout: $400,000
- All shareholders receive $2 per share owned
- Stock price decreases by $2

### STOCK BUYBACKS

**Who can use:** Chairman only (50%+ ownership)
**Effect:** Remove shares from market, increase price
**Cost:** Pay market value for shares removed
**Impact:** $5 price increase per 10,000 shares bought back
**Frequency:** Once per round

**Example:**
- You are Chairman of Titan Steel
- Current price: $40
- Buy back 20,000 shares
- Cost: 20,000 x $40 = $800,000
- Price increases: $5 x 2 = $10
- New price: $50
- Shares in market: 180,000 (down from 200,000)

---

## TURN STRUCTURE

### GAME SETUP
1. All players receive $600,000
2. All stocks set to starting prices
3. Dealer shuffles all 108 cards
4. Round 1 begins

### EACH ROUND (10 total)
1. **Transaction 1:** Player 1 takes turn (draw 3 cards, buy/sell/pass)
2. **Transaction 2:** Player 2 takes turn
3. **Transaction 3:** Player 3 takes turn
4. Continue for all players (max 3 transactions per player)
5. **End of Round:**
   - Process Currency +/-10% cards
   - Settle short positions (Investor Mode)
   - Expire options (Strategist Mode)
   - Deal new cards for next round
6. Dealer rotates to next player
7. Next round begins

### GAME END (After Round 10)
1. Calculate final net worth for each player:
   - Cash on hand
   - + Stock value (shares x current price)
   - = Net worth
2. Player with highest net worth wins
3. Tie: Player with most cash wins

---

## CARD DECK COMPOSITION

**Price Cards by Stock:**

Atlas Bank (4 cards):
- -10, -5, +5, +10

Titan Steel (6 cards):
- -15, -10, -5, +5, +10, +15

Global Industries (6 cards):
- -15, -10, -5, +5, +10, +15

Omega Energy (8 cards):
- -20, -15, -10, -5, +5, +10, +15, +20

VitalCare Pharma (10 cards):
- -25, -20, -15, -10, -5, +5, +10, +15, +20, +25

NovaTech (12 cards):
- -30, -25, -20, -15, -10, -5, +5, +10, +15, +20, +25, +30

**Special Cards (14 total):**
- 3x Loan Stocks Matured ($100,000)
- 3x Debenture ($25k, $50k, $100k)
- 3x Rights Issued
- 2x Share Suspended
- 2x Currency +10%
- 1x Currency -10%

**Total Cards:** 46 price cards + 14 special cards = 60 cards

Wait, let me recalculate:
- Atlas: 4
- Titan: 6
- Global: 6
- Omega: 8
- VitalCare: 10
- NovaTech: 12
Total: 46 price cards + 14 special = 60 cards

Actually, the original docs mention 108 cards. Let me check the correct distribution:

Each stock appears on multiple cards, not just one card per price point. The 108 cards total includes:
- Multiple copies of each price value
- Multiple cards for each stock
- The distribution creates the volatility differences

For implementation: Use the card counts as specified in the rules documents. The exact distribution creates game balance.

---

## TECHNICAL REQUIREMENTS

### TECH STACK
**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Framer Motion (animations)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (Google OAuth only)
- Supabase Realtime (multiplayer sync)

**Hosting:**
- Vercel (frontend + serverless functions)

### DATABASE TABLES NEEDED

**users:**
- user_id (UUID, primary key)
- email (from Google OAuth)
- username
- created_at
- games_played_trader, games_played_investor, games_played_strategist
- games_won_trader, games_won_investor, games_won_strategist
- highest_net_worth
- investor_unlocked (boolean)
- strategist_unlocked (boolean)

**games:**
- game_id (UUID, primary key)
- mode (trader/investor/strategist)
- status (waiting/active/completed)
- current_round (1-10)
- current_transaction (1-3)
- current_player_index
- dealer_index
- created_at
- started_at
- completed_at

**game_players:**
- id (UUID, primary key)
- game_id (foreign key)
- user_id (foreign key, nullable for AI)
- player_name
- is_ai (boolean)
- player_order (1-6)
- cash
- net_worth
- status (active/disconnected/bankrupt)

**player_holdings:**
- id (UUID, primary key)
- game_player_id (foreign key)
- stock_symbol
- shares_owned
- average_cost

**transactions:**
- id (UUID, primary key)
- game_id (foreign key)
- game_player_id (foreign key)
- round_number
- transaction_number
- action_type (buy/sell/short/option/dividend/buyback/pass)
- stock_symbol
- quantity
- price
- total_value
- timestamp

**short_positions:** (Investor Mode)
- id (UUID, primary key)
- game_player_id (foreign key)
- stock_symbol
- shares_shorted
- entry_price
- status (open/closed)

**options_positions:** (Strategist Mode)
- id (UUID, primary key)
- game_player_id (foreign key)
- stock_symbol
- option_type (call/put)
- strike_price
- shares
- premium_paid
- status (open/exercised/expired)

**stock_prices:**
- id (UUID, primary key)
- game_id (foreign key)
- stock_symbol
- round_number
- price
- timestamp

**achievements:**
- achievement_id (UUID, primary key)
- name
- description
- mode
- icon_url
- rarity

**user_achievements:**
- user_id (foreign key)
- achievement_id (foreign key)
- unlocked_at

---

## CRITICAL GAME LOGIC ALGORITHMS

### BUY CONDITION VALIDATOR
```
function canBuyStock(player, stock, cards):
    // Check if first buyer
    if stock.totalSharesOwned == 0:
        return true
    
    // Calculate card sum
    cardSum = sum(cards)
    
    // Must be >= 0
    if cardSum >= 0:
        return true
    
    return false
```

### PRICE CALCULATOR
```
function calculateNewPrice(currentPrice, cards):
    cardSum = sum(cards.map(card => card.value))
    newPrice = currentPrice + cardSum
    
    // Price cannot go below 0
    if newPrice < 0:
        newPrice = 0
    
    return newPrice
```

### OWNERSHIP CALCULATOR
```
function calculateOwnership(player, stock):
    totalShares = 200000
    playerShares = player.holdings[stock.symbol]
    
    percentage = (playerShares / totalShares) * 100
    
    if percentage >= 50:
        return 'chairman'
    else if percentage >= 25:
        return 'director'
    else:
        return 'none'
```

### NET WORTH CALCULATOR
```
function calculateNetWorth(player, currentPrices):
    netWorth = player.cash
    
    for each holding in player.holdings:
        stockValue = holding.shares * currentPrices[holding.stock]
        netWorth += stockValue
    
    return netWorth
```

---

## UI/UX REQUIREMENTS

### RESPONSIVE DESIGN
- Mobile: 320px - 768px (vertical stacking)
- Tablet: 769px - 1024px (2-column layout)
- Desktop: 1025px+ (full layout)

### COMPANY COLOR SCHEME
- Atlas Bank: Navy (#1E3A5F) + Gold (#FFD700)
- Titan Steel: Gray (#6B7280) + Silver (#E5E7EB)
- Global Industries: Blue (#3B82F6) + Green (#10B981)
- Omega Energy: Orange (#F97316) + Red (#EF4444)
- VitalCare Pharma: Teal (#14B8A6) + Green (#10B981)
- NovaTech: Purple (#8B5CF6) + Blue (#3B82F6)

### KEY ANIMATIONS
- Stock price changes: Number counter + color flash
- Money transactions: Flying money animation
- Card reveals: Flip animation with stagger
- Special events: Appropriate themed animations

### CRITICAL UI ELEMENTS
**Game Board:**
- Stock cards (6 cards, 2 rows x 3 columns)
- Portfolio panel (cash, holdings, net worth)
- Transaction panel (buy/sell buttons)
- Round/transaction indicator
- Player turn indicator
- Card reveal area

**Stock Card:**
- Company logo/name
- Current price (large, bold)
- Price change indicator
- Available shares
- Your holdings
- Director/Chairman badge

**Portfolio Panel:**
- Cash: $XXX,XXX (large, bold)
- Total stock value: $XXX,XXX
- Net worth: $XXX,XXX (largest)
- Holdings list by stock

---

## REAL-TIME MULTIPLAYER REQUIREMENTS

### GAME STATE SYNC
**Must sync in real-time:**
- Player actions (buy/sell/pass)
- Stock price changes
- Card reveals
- Turn changes
- Round progression
- Player disconnections

**Use Supabase Realtime:**
- Subscribe to game_id channel
- Broadcast player actions
- Listen for state changes
- Update UI immediately

### DISCONNECTION HANDLING
**When player disconnects:**
1. Mark player as disconnected
2. Pause game for 60 seconds
3. Show "waiting for player" message
4. If player doesn't return:
   - Replace with AI player
   - Continue game
5. If player returns:
   - Resume game
   - Sync current state

---

## TUTORIAL REQUIREMENTS

### TRADER MODE TUTORIAL
**Step-by-step guide covering:**
1. Game objective (highest net worth)
2. Reading stock cards
3. Understanding card draws
4. Buy condition rule
5. Making first purchase
6. Selling stocks
7. Special cards overview
8. Director/Chairman powers
9. Round structure
10. Winning strategies

**Format:**
- Overlay tooltips
- Highlighted elements
- "Next" and "Skip" buttons
- Practice round (doesn't count)
- Progress indicator

### INVESTOR MODE TUTORIAL
**Covers:**
1. What is shorting
2. How to open short position
3. Settlement mechanics
4. Bankruptcy risk
5. Strategy tips

### STRATEGIST MODE TUTORIAL
**Covers:**
1. Options basics (calls/puts)
2. Dividends mechanics
3. Buybacks mechanics
4. When to use each tool

---

## AI PLAYER REQUIREMENTS

### DIFFICULTY LEVELS

**EASY AI:**
- Makes random valid moves
- Doesn't use powers optimally
- 40% optimal play rate
- Good for learning

**MEDIUM AI:**
- Follows basic strategies
- Focuses on 2-3 stocks
- Uses Director powers
- 60% optimal play rate

**HARD AI:**
- Reads market trends
- Strategic positioning
- Blocks opponents
- Uses all powers effectively
- 85% optimal play rate

**AI Behavior:**
- 2-3 second "thinking" delay
- Shows realistic decision making
- Makes occasional mistakes
- Adapts to player strategy

---

## ACHIEVEMENT DEFINITIONS

### TRADER MODE
- First Blood: Complete first game
- Trader Pro: Win 3 games
- Director's Chair: Become Director
- Power Player: Become Chairman
- Perfect Storm: Win with all positive cards in one round

### INVESTOR MODE
- Short Seller: Profit from first short
- Bear Market: Profit $100k+ from shorting in one game
- Risk Taker: Short while owning $500k+ stocks
- Narrow Escape: Avoid bankruptcy by less than $50k

### STRATEGIST MODE
- Options Master: Exercise 10 profitable options
- Dividend King: Issue $500k+ dividends in one game
- Corporate Raider: Use buyback to steal Chairmanship
- Market Manipulator: Adjust option premiums 5+ times
- Triple Threat: Use options, dividends, AND buybacks in one game

---

## DEVELOPMENT PRIORITIES FOR MVP

### PHASE 1 (CRITICAL)
1. Authentication (Google OAuth)
2. Database setup
3. Landing page
4. Dashboard
5. Game lobby system
6. Trader Mode game board
7. Core game logic (buy/sell)
8. Real-time sync

### PHASE 2 (IMPORTANT)
9. Special cards implementation
10. Director/Chairman powers
11. Tutorial system
12. Mobile responsive design
13. Game ending and scoring

### PHASE 3 (ENHANCED)
14. Investor Mode (shorting)
15. Game history and statistics
16. Achievements system
17. AI players (Medium difficulty)

### PHASE 4 (ADVANCED)
18. Strategist Mode (options/dividends/buybacks)
19. Leaderboard
20. Polish and animations
21. Performance optimization

---

## IMPORTANT NOTES

### ALWAYS USE:
- TypeScript for type safety
- Proper error handling
- Loading states for async operations
- Optimistic UI updates
- Environment variables for secrets
- Git commits after each working feature

### NEVER:
- Hardcode API keys in code
- Skip input validation
- Ignore edge cases
- Use decimals for money (use integers, cents)
- Allow negative cash (except in shorting scenarios)
- Let users access locked modes

### TESTING PRIORITIES:
1. Buy/sell validation logic
2. Price calculation accuracy
3. Net worth calculation
4. Real-time sync accuracy
5. Special cards effects
6. Mode unlock conditions
7. Multiplayer synchronization

---

## SUCCESS CRITERIA

**MVP is complete when:**
- Users can sign in with Google
- Users can create and join games
- Trader Mode works perfectly for 2-6 players
- Real-time multiplayer is stable
- Mobile responsive
- No critical bugs
- Game ends and scores correctly
- Stats update properly

**Full v1.0 is complete when:**
- All 3 modes working
- AI players functional
- Achievements system active
- Tutorial for each mode
- History and statistics
- Deployed to production
- Tested with real users

---

This context document should be referenced throughout development to maintain consistency with game rules and technical requirements.