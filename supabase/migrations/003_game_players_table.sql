-- Game Players Table
-- Stores player participation data, holdings, and state within each game

CREATE TABLE game_players (
    player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Player Position in Game
    player_position INTEGER NOT NULL CHECK (player_position >= 1),

    -- Financial State
    cash_balance INTEGER NOT NULL CHECK (cash_balance >= 0),
    net_worth INTEGER DEFAULT 0 CHECK (net_worth >= 0),
    is_bankrupt BOOLEAN DEFAULT FALSE,

    -- Stock Holdings (JSONB for flexibility)
    -- Format: {"atlas_bank": 5000, "titan_steel": 3000, ...}
    stock_holdings JSONB NOT NULL DEFAULT '{
        "atlas_bank": 0,
        "titan_steel": 0,
        "global_industries": 0,
        "omega_energy": 0,
        "vitalcare_pharma": 0,
        "novatech": 0
    }'::jsonb,

    -- Investor Mode: Short Positions
    -- Format: {"omega_energy": 10000, "novatech": 5000}
    short_positions JSONB DEFAULT '{}'::jsonb,

    -- Strategist Mode: Option Positions
    -- Format: [{"type": "call", "stock": "novatech", "strike": 120, "quantity": 5000, "premium_paid": 15000}]
    option_positions JSONB DEFAULT '[]'::jsonb,

    -- Cards in Hand (current round)
    -- Format: [{"card_id": "uuid", "stock": "atlas_bank", "value": 10, "type": "price"}]
    current_cards JSONB DEFAULT '[]'::jsonb,

    -- Director and Chairman Status (calculated)
    director_of JSONB DEFAULT '[]'::jsonb, -- ["atlas_bank", "titan_steel"]
    chairman_of JSONB DEFAULT '[]'::jsonb, -- ["global_industries"]

    -- Final Game Results
    final_rank INTEGER CHECK (final_rank >= 1),
    final_net_worth INTEGER CHECK (final_net_worth >= 0),

    -- Timestamps
    joined_at TIMESTAMP DEFAULT NOW(),
    last_action_at TIMESTAMP,

    -- Constraints
    UNIQUE (game_id, user_id), -- User can only join a game once
    UNIQUE (game_id, player_position) -- Each position unique per game
);

-- Indexes for performance
CREATE INDEX idx_game_players_game ON game_players(game_id);
CREATE INDEX idx_game_players_user ON game_players(user_id);
CREATE INDEX idx_game_players_position ON game_players(game_id, player_position);
CREATE INDEX idx_game_players_joined ON game_players(joined_at);
CREATE INDEX idx_game_players_last_action ON game_players(last_action_at);

-- Composite indexes for common queries
CREATE INDEX idx_game_players_game_user ON game_players(game_id, user_id);
CREATE INDEX idx_game_players_active ON game_players(game_id, is_bankrupt) WHERE is_bankrupt = FALSE;
CREATE INDEX idx_game_players_rankings ON game_players(game_id, final_rank) WHERE final_rank IS NOT NULL;

-- JSONB indexes for holdings queries
CREATE INDEX idx_game_players_stock_holdings ON game_players USING GIN (stock_holdings);
CREATE INDEX idx_game_players_short_positions ON game_players USING GIN (short_positions);
CREATE INDEX idx_game_players_option_positions ON game_players USING GIN (option_positions);
CREATE INDEX idx_game_players_current_cards ON game_players USING GIN (current_cards);
CREATE INDEX idx_game_players_director_of ON game_players USING GIN (director_of);
CREATE INDEX idx_game_players_chairman_of ON game_players USING GIN (chairman_of);

-- Comments
COMMENT ON TABLE game_players IS 'Player participation and state within games';
COMMENT ON COLUMN game_players.player_position IS 'Turn order: 1-6 for standard, 1-12 for extended';
COMMENT ON COLUMN game_players.cash_balance IS 'Current cash in rupees (starts at 600000 or 450000)';
COMMENT ON COLUMN game_players.net_worth IS 'Total value: cash + stock holdings + short positions + options';
COMMENT ON COLUMN game_players.stock_holdings IS 'Number of shares owned for each stock';
COMMENT ON COLUMN game_players.short_positions IS 'Investor mode: shares sold short per stock';
COMMENT ON COLUMN game_players.option_positions IS 'Strategist mode: call/put options contracts';
COMMENT ON COLUMN game_players.current_cards IS 'Cards dealt for the current round';
COMMENT ON COLUMN game_players.director_of IS 'Stocks where player is a director (25%/20% ownership)';
COMMENT ON COLUMN game_players.chairman_of IS 'Stocks where player is chairman (50%/40% ownership)';
COMMENT ON COLUMN game_players.final_rank IS '1st, 2nd, 3rd... based on final net worth';
COMMENT ON COLUMN game_players.final_net_worth IS 'Net worth when game completed';

-- Function to update last_action_at timestamp
CREATE OR REPLACE FUNCTION update_player_last_action()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_action_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_action_at
CREATE TRIGGER update_player_action_timestamp
    BEFORE UPDATE ON game_players
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_player_last_action();

-- Function to calculate net worth
CREATE OR REPLACE FUNCTION calculate_net_worth(
    p_player_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_cash INTEGER;
    v_stock_value INTEGER := 0;
    v_short_value INTEGER := 0;
    v_option_value INTEGER := 0;
    v_game_id UUID;
    v_stock TEXT;
    v_quantity INTEGER;
    v_price INTEGER;
    v_stock_prices JSONB;
BEGIN
    -- Get player's cash and game_id
    SELECT cash_balance, game_id INTO v_cash, v_game_id
    FROM game_players
    WHERE player_id = p_player_id;

    -- Get current stock prices
    SELECT stock_prices INTO v_stock_prices
    FROM games
    WHERE game_id = v_game_id;

    -- Calculate stock holdings value
    FOR v_stock IN SELECT jsonb_object_keys(stock_holdings)
                   FROM game_players WHERE player_id = p_player_id
    LOOP
        SELECT (stock_holdings->>v_stock)::INTEGER INTO v_quantity
        FROM game_players WHERE player_id = p_player_id;

        SELECT (v_stock_prices->>v_stock)::INTEGER INTO v_price;

        v_stock_value := v_stock_value + (v_quantity * v_price);
    END LOOP;

    -- Return total net worth
    RETURN v_cash + v_stock_value + v_short_value + v_option_value;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-set cash_balance on player creation
CREATE OR REPLACE FUNCTION set_player_starting_capital()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cash_balance := (SELECT starting_capital FROM games WHERE game_id = NEW.game_id);
    NEW.net_worth := NEW.cash_balance;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set starting capital
CREATE TRIGGER set_starting_capital_trigger
    BEFORE INSERT ON game_players
    FOR EACH ROW
    EXECUTE FUNCTION set_player_starting_capital();

-- Function to validate player position and final rank
CREATE OR REPLACE FUNCTION validate_game_player()
RETURNS TRIGGER AS $$
DECLARE
    v_player_count INTEGER;
    v_game_status VARCHAR(20);
BEGIN
    -- Get game info
    SELECT player_count, status INTO v_player_count, v_game_status
    FROM games
    WHERE game_id = NEW.game_id;

    -- Validate player_position is within player_count
    IF NEW.player_position > v_player_count THEN
        RAISE EXCEPTION 'player_position % exceeds game player_count of %', NEW.player_position, v_player_count;
    END IF;

    -- Validate final_rank only set when game is completed
    IF NEW.final_rank IS NOT NULL AND v_game_status != 'completed' THEN
        RAISE EXCEPTION 'final_rank can only be set when game status is completed, current status: %', v_game_status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate player constraints
CREATE TRIGGER validate_game_player_trigger
    BEFORE INSERT OR UPDATE ON game_players
    FOR EACH ROW
    EXECUTE FUNCTION validate_game_player();
