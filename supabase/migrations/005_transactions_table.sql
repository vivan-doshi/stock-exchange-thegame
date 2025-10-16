-- Transactions Table
-- Complete audit log of all player actions and transactions within games

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES game_players(player_id) ON DELETE CASCADE,

    -- Transaction Timing
    round_number INTEGER NOT NULL CHECK (round_number >= 1),
    transaction_number INTEGER NOT NULL CHECK (transaction_number >= 1 AND transaction_number <= 3),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Transaction Type
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'buy_shares',
        'sell_shares',
        'short_shares',        -- Investor mode
        'cover_short',         -- Investor mode
        'buy_option',          -- Strategist mode
        'exercise_option',     -- Strategist mode
        'issue_dividend',      -- Strategist mode (Chairman only)
        'announce_buyback',    -- Strategist mode (Chairman only)
        'use_special_card',    -- Special cards (loan, rights, etc.)
        'card_effect',         -- Automatic card price changes
        'bankruptcy'           -- Player went bankrupt
    )),

    -- Transaction Details
    stock_symbol VARCHAR(50) CHECK (stock_symbol IN (
        'atlas_bank',
        'titan_steel',
        'global_industries',
        'omega_energy',
        'vitalcare_pharma',
        'novatech'
    )),

    quantity INTEGER CHECK (quantity > 0),
    price_per_share INTEGER CHECK (price_per_share >= 0),
    total_amount INTEGER NOT NULL,

    -- Pre and Post Transaction Balances
    cash_before INTEGER CHECK (cash_before >= 0),
    cash_after INTEGER CHECK (cash_after >= 0),

    -- Additional Details (JSONB for flexibility)
    -- Used for: option strike prices, special card effects, dividend amounts, etc.
    details JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT amount_matches_calculation CHECK (
        total_amount = COALESCE(quantity * price_per_share, total_amount)
    )
);

-- Indexes for performance
CREATE INDEX idx_transactions_game ON transactions(game_id);
CREATE INDEX idx_transactions_player ON transactions(player_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_stock ON transactions(stock_symbol);
CREATE INDEX idx_transactions_round ON transactions(round_number);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_game_round ON transactions(game_id, round_number);
CREATE INDEX idx_transactions_player_round ON transactions(player_id, round_number);
CREATE INDEX idx_transactions_game_player ON transactions(game_id, player_id);
CREATE INDEX idx_transactions_game_stock ON transactions(game_id, stock_symbol);
CREATE INDEX idx_transactions_game_type ON transactions(game_id, transaction_type);

-- Index for transaction sequence
CREATE INDEX idx_transactions_sequence ON transactions(game_id, round_number, transaction_number);

-- Index for time-series queries
CREATE INDEX idx_transactions_timeline ON transactions(game_id, created_at);

-- JSONB index for details
CREATE INDEX idx_transactions_details ON transactions USING GIN (details);

-- Comments
COMMENT ON TABLE transactions IS 'Complete audit log of all game transactions and player actions';
COMMENT ON COLUMN transactions.transaction_number IS '1, 2, or 3 - which transaction in the round';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of action: buy, sell, short, option, dividend, buyback, special card';
COMMENT ON COLUMN transactions.stock_symbol IS 'Which stock is affected (NULL for general actions)';
COMMENT ON COLUMN transactions.quantity IS 'Number of shares/options traded';
COMMENT ON COLUMN transactions.price_per_share IS 'Price at time of transaction';
COMMENT ON COLUMN transactions.total_amount IS 'Total value of transaction (can be negative for payments)';
COMMENT ON COLUMN transactions.cash_before IS 'Player cash balance before transaction';
COMMENT ON COLUMN transactions.cash_after IS 'Player cash balance after transaction';
COMMENT ON COLUMN transactions.details IS 'Additional info: {strike_price, option_type, card_name, dividend_amount, etc.}';

-- View for transaction history with player and game info
CREATE OR REPLACE VIEW transaction_history AS
SELECT
    t.transaction_id,
    t.game_id,
    g.game_mode,
    g.game_variant,
    t.player_id,
    gp.user_id,
    u.username,
    t.round_number,
    t.transaction_number,
    t.transaction_type,
    t.stock_symbol,
    t.quantity,
    t.price_per_share,
    t.total_amount,
    t.cash_before,
    t.cash_after,
    t.details,
    t.created_at
FROM transactions t
JOIN games g ON t.game_id = g.game_id
JOIN game_players gp ON t.player_id = gp.player_id
JOIN users u ON gp.user_id = u.user_id
ORDER BY t.created_at DESC;

COMMENT ON VIEW transaction_history IS 'Transaction log with player and game context';

-- View for round summaries
CREATE OR REPLACE VIEW round_transaction_summary AS
SELECT
    game_id,
    round_number,
    COUNT(*) as total_transactions,
    COUNT(DISTINCT player_id) as active_players,
    SUM(CASE WHEN transaction_type = 'buy_shares' THEN quantity ELSE 0 END) as total_shares_bought,
    SUM(CASE WHEN transaction_type = 'sell_shares' THEN quantity ELSE 0 END) as total_shares_sold,
    SUM(CASE WHEN transaction_type = 'short_shares' THEN quantity ELSE 0 END) as total_shares_shorted,
    SUM(CASE WHEN transaction_type = 'buy_option' THEN quantity ELSE 0 END) as total_options_purchased,
    SUM(total_amount) as total_volume
FROM transactions
GROUP BY game_id, round_number
ORDER BY game_id, round_number;

COMMENT ON VIEW round_transaction_summary IS 'Aggregate statistics per round for analytics';

-- View for player trading activity
CREATE OR REPLACE VIEW player_trading_activity AS
SELECT
    t.player_id,
    gp.user_id,
    u.username,
    t.game_id,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN t.transaction_type = 'buy_shares' THEN 1 END) as buy_count,
    COUNT(CASE WHEN t.transaction_type = 'sell_shares' THEN 1 END) as sell_count,
    COUNT(CASE WHEN t.transaction_type = 'short_shares' THEN 1 END) as short_count,
    SUM(CASE WHEN t.transaction_type IN ('buy_shares', 'sell_shares') THEN ABS(t.total_amount) ELSE 0 END) as trading_volume,
    MAX(t.created_at) as last_trade_at
FROM transactions t
JOIN game_players gp ON t.player_id = gp.player_id
JOIN users u ON gp.user_id = u.user_id
GROUP BY t.player_id, gp.user_id, u.username, t.game_id;

COMMENT ON VIEW player_trading_activity IS 'Trading statistics per player per game';

-- Function to log a transaction
CREATE OR REPLACE FUNCTION log_transaction(
    p_game_id UUID,
    p_player_id UUID,
    p_round_number INTEGER,
    p_transaction_number INTEGER,
    p_transaction_type VARCHAR(50),
    p_stock_symbol VARCHAR(50),
    p_quantity INTEGER,
    p_price_per_share INTEGER,
    p_total_amount INTEGER,
    p_details JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_cash_before INTEGER;
    v_cash_after INTEGER;
BEGIN
    -- Get current cash balance (before)
    SELECT cash_balance INTO v_cash_before
    FROM game_players
    WHERE player_id = p_player_id;

    -- Calculate cash after (will be updated by calling function)
    v_cash_after := v_cash_before + p_total_amount;

    -- Insert transaction
    INSERT INTO transactions (
        game_id,
        player_id,
        round_number,
        transaction_number,
        transaction_type,
        stock_symbol,
        quantity,
        price_per_share,
        total_amount,
        cash_before,
        cash_after,
        details
    ) VALUES (
        p_game_id,
        p_player_id,
        p_round_number,
        p_transaction_number,
        p_transaction_type,
        p_stock_symbol,
        p_quantity,
        p_price_per_share,
        p_total_amount,
        v_cash_before,
        v_cash_after,
        p_details
    )
    RETURNING transaction_id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_transaction IS 'Helper function to log a transaction with automatic balance tracking';

-- Function to get transaction count for a player in current round
CREATE OR REPLACE FUNCTION get_player_round_transaction_count(
    p_player_id UUID,
    p_round_number INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM transactions
    WHERE player_id = p_player_id
      AND round_number = p_round_number
      AND transaction_type IN ('buy_shares', 'sell_shares', 'short_shares', 'buy_option');

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_player_round_transaction_count IS 'Returns number of transactions player has made in current round (max 3)';
