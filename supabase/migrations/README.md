# Database Migrations for Stock Market Tycoon

This directory contains SQL migration files for the Stock Market Tycoon game database.

## Migration Files

### 001_users_table.sql
- Creates the `users` table for user accounts
- Tracks game statistics per mode (Trader, Investor, Strategist)
- Manages mode unlocks and user preferences
- Includes indexes for performance and data validation constraints

**Key Features:**
- Mode unlock tracking (Investor after 5 Trader games, Strategist after 5 Investor games)
- Support for both Standard and Extended variants
- Game statistics: games played/won per mode
- Personal records: highest net worth
- User preferences: sound, animations, preferred mode/variant

### 002_games_table.sql
- Creates the `games` table for game sessions
- Supports Standard (2-6 players, ₹600k capital) and Extended (7-12 players, ₹450k capital) variants
- Stores game state as JSONB (stock prices, share supply, options)
- Auto-configures variant-specific settings via trigger

**Key Features:**
- Game status tracking: waiting, in_progress, completed, abandoned
- Variant-specific thresholds (Director/Chairman)
- Stock prices and share supply (affected by buybacks)
- Options contracts for Strategist mode
- Automatic configuration based on variant selection

### 003_game_players_table.sql
- Creates the `game_players` table for player participation
- Tracks cash balance, holdings, and positions
- Stores stock holdings, shorts, and options as JSONB
- Auto-sets starting capital based on game variant

**Key Features:**
- Financial state: cash, net worth, bankruptcy status
- Stock holdings per player
- Short positions (Investor mode)
- Option positions (Strategist mode)
- Cards in hand for current round
- Director/Chairman status tracking
- Helper functions for net worth calculation

### 004_player_holdings_table.sql
- Creates the `player_holdings` table for historical tracking
- Complements JSONB holdings in game_players with structured data
- Records snapshots at end of each round
- Calculates ownership percentages and Director/Chairman status

**Key Features:**
- Round-by-round holdings history
- Market valuation and unrealized gains/losses
- Ownership percentage tracking
- Director/Chairman status per stock
- Analytics views for current holdings
- Snapshot function for end-of-round recording

### 005_transactions_table.sql
- Creates the `transactions` table for complete audit log
- Tracks all player actions: buy, sell, short, options, dividends, buybacks
- Records pre/post transaction balances
- Includes multiple views for analytics

**Key Features:**
- Transaction types: buy, sell, short, cover, options, dividends, buybacks, special cards
- Round and transaction number tracking (max 3 per round)
- Cash balance tracking (before/after)
- JSONB details for complex transactions
- Helper functions for logging transactions
- Views: transaction history, round summaries, player activity

### 006_stock_prices_table.sql
- Creates the `stock_price_history` table
- Records stock prices at end of each round
- Includes views for price changes and volatility analysis

**Key Features:**
- Historical price tracking for all 6 stocks
- One row per round per game
- Helper function to record prices automatically
- Normalized view (one row per stock per round)
- Price change analysis view (round-over-round)
- Volatility metrics (average, min, max, standard deviation)

### 007_achievements_tables.sql
- Creates `achievements` and `user_achievements` tables
- Defines 25+ achievements across all rarities
- Tracks unlock progress and game context

**Key Features:**
- Achievement types: Common, Rare, Epic, Legendary
- Mode and variant specific achievements
- Hidden achievements (revealed on unlock)
- Progress tracking for multi-step achievements
- Helper functions to unlock and check eligibility
- Pre-populated with 25 default achievements
- Multiple views: progress, statistics, recent unlocks, user summaries

## Applying Migrations

### Using Supabase CLI

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations in order
supabase db push

# Or apply individually
supabase db push --file supabase/migrations/001_users_table.sql
supabase db push --file supabase/migrations/002_games_table.sql
# ... etc
```

### Using psql

```bash
# Connect to your database
psql -h your-host -U your-user -d your-database

# Run each migration in order
\i supabase/migrations/001_users_table.sql
\i supabase/migrations/002_games_table.sql
\i supabase/migrations/003_game_players_table.sql
\i supabase/migrations/004_player_holdings_table.sql
\i supabase/migrations/005_transactions_table.sql
\i supabase/migrations/006_stock_prices_table.sql
\i supabase/migrations/007_achievements_tables.sql
```

## Database Schema Overview

### Core Tables
1. **users** - User accounts and statistics
2. **games** - Game sessions
3. **game_players** - Player participation in games
4. **player_holdings** - Historical holdings snapshots
5. **transactions** - Transaction audit log
6. **stock_price_history** - Price tracking
7. **achievements** - Available achievements
8. **user_achievements** - Unlocked achievements

### Key Relationships
- `users` → `game_players` (one-to-many)
- `games` → `game_players` (one-to-many)
- `games` → `transactions` (one-to-many)
- `games` → `stock_price_history` (one-to-many)
- `game_players` → `player_holdings` (one-to-many)
- `game_players` → `transactions` (one-to-many)
- `users` ← `user_achievements` → `achievements` (many-to-many)

### Helper Functions
- `set_game_variant_defaults()` - Auto-configure game based on variant
- `set_player_starting_capital()` - Set player's starting cash
- `calculate_net_worth(player_id)` - Calculate current net worth
- `snapshot_player_holdings(game_id, round)` - Record holdings
- `record_stock_prices(game_id, round)` - Record price history
- `log_transaction(...)` - Create transaction record
- `unlock_achievement(user_id, name)` - Unlock achievement

### Useful Views
- `current_player_holdings` - Current round holdings
- `transaction_history` - Transactions with context
- `round_transaction_summary` - Round analytics
- `player_trading_activity` - Player trading stats
- `stock_price_history_normalized` - Prices in long format
- `stock_price_changes` - Price changes between rounds
- `stock_volatility` - Volatility metrics
- `user_achievement_progress` - Achievement status per user
- `achievement_statistics` - Achievement unlock stats
- `recent_achievement_unlocks` - Latest unlocks

## Variant Support

The schema fully supports both game variants:

### Standard Variant (2-6 players)
- Starting capital: ₹600,000
- Max shares per stock: 200,000
- Director threshold: 50,000 shares (25%)
- Chairman threshold: 100,000 shares (50%)
- Deck multiplier: 1x

### Extended Variant (7-12 players)
- Starting capital: ₹450,000
- Max shares per stock: 300,000
- Director threshold: 60,000 shares (20%)
- Chairman threshold: 120,000 shares (40%)
- Deck multiplier: 2x (double deck)

## Notes

- All monetary values are stored as INTEGER (in rupees)
- UUIDs are used for all primary keys
- JSONB is used for flexible game state storage
- Proper indexes are created for common query patterns
- Foreign key constraints ensure referential integrity
- Check constraints validate data integrity
- Triggers handle automatic calculations
- Comprehensive comments document the schema

## Testing

After applying migrations, verify the schema:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check all views exist
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check all functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verify achievements were inserted
SELECT COUNT(*) FROM achievements;
-- Should return 25

-- Test variant defaults trigger
INSERT INTO games (game_mode, game_variant, player_count, status)
VALUES ('trader', 'standard', 4, 'waiting')
RETURNING starting_capital, max_shares_per_stock, director_threshold, chairman_threshold;
-- Should return: 600000, 200000, 50000, 100000
```

## Support

For issues or questions about the database schema:
- Check the technical specifications in `/documents/technical_specs.md`
- Review the game rules in `/documents/stock_market_tycoon_rules.md`
- See architecture guide in `/documents/architecture_guide.md`
