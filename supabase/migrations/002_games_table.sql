-- Games Table
-- Stores game sessions with mode, variant, status, and game state

CREATE TABLE games (
    game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Game Configuration
    game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('trader', 'investor', 'strategist')),
    game_variant VARCHAR(20) NOT NULL CHECK (game_variant IN ('standard', 'extended')),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'abandoned')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Game Progress
    current_round INTEGER DEFAULT 1 CHECK (current_round >= 1 AND current_round <= 10),
    current_transaction INTEGER DEFAULT 1 CHECK (current_transaction >= 1 AND current_transaction <= 3),
    dealer_position INTEGER CHECK (dealer_position >= 1),

    -- Player Configuration
    player_count INTEGER NOT NULL CHECK (player_count >= 2),
    rounds_total INTEGER DEFAULT 10 CHECK (rounds_total > 0),

    -- Variant-Specific Settings
    starting_capital INTEGER NOT NULL,
    max_shares_per_stock INTEGER NOT NULL,
    director_threshold INTEGER NOT NULL,
    chairman_threshold INTEGER NOT NULL,
    deck_multiplier INTEGER NOT NULL CHECK (deck_multiplier IN (1, 2)),

    -- Game Winner
    winner_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,

    -- Game State (stored as JSONB for flexibility)
    stock_prices JSONB NOT NULL DEFAULT '{
        "atlas_bank": 100,
        "titan_steel": 100,
        "global_industries": 100,
        "omega_energy": 100,
        "vitalcare_pharma": 100,
        "novatech": 100
    }'::jsonb,

    share_supply JSONB NOT NULL DEFAULT '{
        "atlas_bank": 200000,
        "titan_steel": 200000,
        "global_industries": 200000,
        "omega_energy": 200000,
        "vitalcare_pharma": 200000,
        "novatech": 200000
    }'::jsonb,

    -- Strategist Mode: Options contracts currently available
    options_available JSONB DEFAULT '[]'::jsonb,

    -- Constraints
    CONSTRAINT player_count_variant_check CHECK (
        (game_variant = 'standard' AND player_count >= 2 AND player_count <= 6) OR
        (game_variant = 'extended' AND player_count >= 7 AND player_count <= 12)
    ),
    CONSTRAINT started_after_created CHECK (started_at IS NULL OR started_at >= created_at),
    CONSTRAINT completed_after_started CHECK (completed_at IS NULL OR completed_at >= started_at),
    CONSTRAINT winner_only_when_completed CHECK (
        (status = 'completed' AND winner_user_id IS NOT NULL) OR
        (status != 'completed' AND winner_user_id IS NULL)
    ),
    CONSTRAINT dealer_position_valid CHECK (dealer_position IS NULL OR dealer_position <= player_count)
);

-- Indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_mode ON games(game_mode);
CREATE INDEX idx_games_variant ON games(game_variant);
CREATE INDEX idx_games_created_at ON games(created_at);
CREATE INDEX idx_games_started_at ON games(started_at);
CREATE INDEX idx_games_completed_at ON games(completed_at);
CREATE INDEX idx_games_winner ON games(winner_user_id);

-- Composite indexes for common queries
CREATE INDEX idx_games_status_variant ON games(status, game_variant);
CREATE INDEX idx_games_mode_status ON games(game_mode, status);
CREATE INDEX idx_games_active ON games(status, started_at) WHERE status = 'in_progress';

-- JSONB indexes for game state queries
CREATE INDEX idx_games_stock_prices ON games USING GIN (stock_prices);
CREATE INDEX idx_games_share_supply ON games USING GIN (share_supply);
CREATE INDEX idx_games_options ON games USING GIN (options_available);

-- Comments
COMMENT ON TABLE games IS 'Game sessions with configuration, state, and progress tracking';
COMMENT ON COLUMN games.game_mode IS 'Trader (basic), Investor (shorting), or Strategist (options/dividends)';
COMMENT ON COLUMN games.game_variant IS 'Standard (2-6 players, 600k capital) or Extended (7-12 players, 450k capital)';
COMMENT ON COLUMN games.starting_capital IS '600000 for standard, 450000 for extended';
COMMENT ON COLUMN games.max_shares_per_stock IS '200000 for standard, 300000 for extended';
COMMENT ON COLUMN games.director_threshold IS '50000 shares (25%) for standard, 60000 shares (20%) for extended';
COMMENT ON COLUMN games.chairman_threshold IS '100000 shares (50%) for standard, 120000 shares (40%) for extended';
COMMENT ON COLUMN games.deck_multiplier IS '1 for standard (single deck), 2 for extended (double deck)';
COMMENT ON COLUMN games.stock_prices IS 'Current price for each of the 6 stocks in rupees';
COMMENT ON COLUMN games.share_supply IS 'Available shares per stock (affected by buybacks in Strategist mode)';
COMMENT ON COLUMN games.options_available IS 'Active options contracts in Strategist mode';

-- Function to auto-set variant-specific settings
CREATE OR REPLACE FUNCTION set_game_variant_defaults()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.game_variant = 'standard' THEN
        NEW.starting_capital := 600000;
        NEW.max_shares_per_stock := 200000;
        NEW.director_threshold := 50000;
        NEW.chairman_threshold := 100000;
        NEW.deck_multiplier := 1;
        NEW.share_supply := '{
            "atlas_bank": 200000,
            "titan_steel": 200000,
            "global_industries": 200000,
            "omega_energy": 200000,
            "vitalcare_pharma": 200000,
            "novatech": 200000
        }'::jsonb;
    ELSIF NEW.game_variant = 'extended' THEN
        NEW.starting_capital := 450000;
        NEW.max_shares_per_stock := 300000;
        NEW.director_threshold := 60000;
        NEW.chairman_threshold := 120000;
        NEW.deck_multiplier := 2;
        NEW.share_supply := '{
            "atlas_bank": 300000,
            "titan_steel": 300000,
            "global_industries": 300000,
            "omega_energy": 300000,
            "vitalcare_pharma": 300000,
            "novatech": 300000
        }'::jsonb;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set defaults based on variant
CREATE TRIGGER set_game_defaults_trigger
    BEFORE INSERT ON games
    FOR EACH ROW
    EXECUTE FUNCTION set_game_variant_defaults();
