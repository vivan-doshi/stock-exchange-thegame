-- Player Holdings Table
-- Stores detailed snapshots of player holdings for historical tracking and analytics
-- Complements the JSONB holdings in game_players table

CREATE TABLE player_holdings (
    holding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES game_players(player_id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,

    -- Timing
    round_number INTEGER NOT NULL CHECK (round_number >= 1),
    recorded_at TIMESTAMP DEFAULT NOW(),

    -- Stock Symbol
    stock_symbol VARCHAR(50) NOT NULL CHECK (stock_symbol IN (
        'atlas_bank',
        'titan_steel',
        'global_industries',
        'omega_energy',
        'vitalcare_pharma',
        'novatech'
    )),

    -- Holdings Details
    shares_owned INTEGER DEFAULT 0 CHECK (shares_owned >= 0),
    shares_shorted INTEGER DEFAULT 0 CHECK (shares_shorted >= 0),
    average_buy_price INTEGER CHECK (average_buy_price > 0),
    average_short_price INTEGER CHECK (average_short_price > 0),

    -- Current Valuation
    current_price INTEGER NOT NULL CHECK (current_price >= 0),
    market_value INTEGER NOT NULL CHECK (market_value >= 0),
    unrealized_gain_loss INTEGER DEFAULT 0,

    -- Ownership Status for this stock
    is_director BOOLEAN DEFAULT FALSE,
    is_chairman BOOLEAN DEFAULT FALSE,
    ownership_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),

    -- Constraints
    UNIQUE (player_id, game_id, round_number, stock_symbol),
    CONSTRAINT valid_holdings CHECK (shares_owned >= 0 OR shares_shorted >= 0)
);

-- Indexes for performance
CREATE INDEX idx_holdings_player ON player_holdings(player_id);
CREATE INDEX idx_holdings_game ON player_holdings(game_id);
CREATE INDEX idx_holdings_stock ON player_holdings(stock_symbol);
CREATE INDEX idx_holdings_round ON player_holdings(round_number);
CREATE INDEX idx_holdings_recorded ON player_holdings(recorded_at);

-- Composite indexes for common queries
CREATE INDEX idx_holdings_player_game ON player_holdings(player_id, game_id);
CREATE INDEX idx_holdings_game_round ON player_holdings(game_id, round_number);
CREATE INDEX idx_holdings_player_stock ON player_holdings(player_id, stock_symbol);
CREATE INDEX idx_holdings_game_stock_round ON player_holdings(game_id, stock_symbol, round_number);

-- Indexes for ownership queries
CREATE INDEX idx_holdings_directors ON player_holdings(game_id, stock_symbol, is_director) WHERE is_director = TRUE;
CREATE INDEX idx_holdings_chairmen ON player_holdings(game_id, stock_symbol, is_chairman) WHERE is_chairman = TRUE;

-- Indexes for analytics
CREATE INDEX idx_holdings_by_value ON player_holdings(game_id, round_number, market_value DESC);
CREATE INDEX idx_holdings_gains ON player_holdings(player_id, unrealized_gain_loss DESC);

-- Comments
COMMENT ON TABLE player_holdings IS 'Historical snapshots of player holdings per round for tracking and analytics';
COMMENT ON COLUMN player_holdings.round_number IS 'Round when this snapshot was taken (1-10)';
COMMENT ON COLUMN player_holdings.shares_owned IS 'Number of shares owned (long position)';
COMMENT ON COLUMN player_holdings.shares_shorted IS 'Number of shares shorted (Investor mode)';
COMMENT ON COLUMN player_holdings.average_buy_price IS 'Average price paid per share for long positions';
COMMENT ON COLUMN player_holdings.average_short_price IS 'Average price received per share for short positions';
COMMENT ON COLUMN player_holdings.market_value IS 'Current market value of holdings (shares_owned * current_price)';
COMMENT ON COLUMN player_holdings.unrealized_gain_loss IS 'Profit/loss on position if closed now';
COMMENT ON COLUMN player_holdings.is_director IS 'Director status: 50k shares (25%) standard, 60k shares (20%) extended';
COMMENT ON COLUMN player_holdings.is_chairman IS 'Chairman status: 100k shares (50%) standard, 120k shares (40%) extended';
COMMENT ON COLUMN player_holdings.ownership_percentage IS 'Percentage of total shares owned for this stock';

-- Function to snapshot player holdings at end of round
CREATE OR REPLACE FUNCTION snapshot_player_holdings(
    p_game_id UUID,
    p_round_number INTEGER
) RETURNS VOID AS $$
DECLARE
    v_player RECORD;
    v_stock TEXT;
    v_shares INTEGER;
    v_price INTEGER;
    v_game RECORD;
    v_total_shares INTEGER;
    v_ownership_pct DECIMAL(5,2);
BEGIN
    -- Get game configuration
    SELECT * INTO v_game FROM games WHERE game_id = p_game_id;

    -- Loop through all players in the game
    FOR v_player IN SELECT * FROM game_players WHERE game_id = p_game_id
    LOOP
        -- Loop through each stock
        FOR v_stock IN SELECT * FROM jsonb_object_keys(v_player.stock_holdings)
        LOOP
            -- Get shares owned for this stock
            SELECT (v_player.stock_holdings->>v_stock)::INTEGER INTO v_shares;

            -- Get current price
            SELECT (v_game.stock_prices->>v_stock)::INTEGER INTO v_price;

            -- Get total shares available
            SELECT (v_game.share_supply->>v_stock)::INTEGER INTO v_total_shares;

            -- Calculate ownership percentage
            IF v_total_shares > 0 THEN
                v_ownership_pct := (v_shares::DECIMAL / v_total_shares::DECIMAL) * 100;
            ELSE
                v_ownership_pct := 0;
            END IF;

            -- Insert snapshot
            INSERT INTO player_holdings (
                player_id,
                game_id,
                round_number,
                stock_symbol,
                shares_owned,
                current_price,
                market_value,
                ownership_percentage,
                is_director,
                is_chairman
            ) VALUES (
                v_player.player_id,
                p_game_id,
                p_round_number,
                v_stock,
                v_shares,
                v_price,
                v_shares * v_price,
                v_ownership_pct,
                (v_player.director_of ? v_stock),
                (v_player.chairman_of ? v_stock)
            )
            ON CONFLICT (player_id, game_id, round_number, stock_symbol)
            DO UPDATE SET
                shares_owned = EXCLUDED.shares_owned,
                current_price = EXCLUDED.current_price,
                market_value = EXCLUDED.market_value,
                ownership_percentage = EXCLUDED.ownership_percentage,
                is_director = EXCLUDED.is_director,
                is_chairman = EXCLUDED.is_chairman;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- View for current holdings summary by player
CREATE OR REPLACE VIEW current_player_holdings AS
SELECT
    ph.player_id,
    ph.game_id,
    gp.user_id,
    u.username,
    ph.stock_symbol,
    ph.shares_owned,
    ph.shares_shorted,
    ph.current_price,
    ph.market_value,
    ph.ownership_percentage,
    ph.is_director,
    ph.is_chairman,
    ph.round_number,
    g.current_round
FROM player_holdings ph
JOIN game_players gp ON ph.player_id = gp.player_id
JOIN users u ON gp.user_id = u.user_id
JOIN games g ON ph.game_id = g.game_id
WHERE ph.round_number = g.current_round;

COMMENT ON VIEW current_player_holdings IS 'Current round holdings for all active game players';
