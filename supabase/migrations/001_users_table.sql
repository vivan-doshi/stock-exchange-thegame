-- Users Table
-- Stores user accounts, game statistics, unlocks, and preferences

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,

    -- Game Statistics (Trader Mode)
    games_played_trader INTEGER DEFAULT 0 CHECK (games_played_trader >= 0),
    games_won_trader INTEGER DEFAULT 0 CHECK (games_won_trader >= 0),

    -- Game Statistics (Investor Mode)
    games_played_investor INTEGER DEFAULT 0 CHECK (games_played_investor >= 0),
    games_won_investor INTEGER DEFAULT 0 CHECK (games_won_investor >= 0),

    -- Game Statistics (Strategist Mode)
    games_played_strategist INTEGER DEFAULT 0 CHECK (games_played_strategist >= 0),
    games_won_strategist INTEGER DEFAULT 0 CHECK (games_won_strategist >= 0),

    -- Records
    highest_net_worth INTEGER DEFAULT 0 CHECK (highest_net_worth >= 0),

    -- Mode Unlocks (Investor unlocked after 5 Trader games, Strategist after 5 Investor games)
    investor_unlocked BOOLEAN DEFAULT FALSE,
    strategist_unlocked BOOLEAN DEFAULT FALSE,

    -- User Preferences
    preferred_mode VARCHAR(20) DEFAULT 'trader' CHECK (preferred_mode IN ('trader', 'investor', 'strategist')),
    preferred_variant VARCHAR(20) DEFAULT 'standard' CHECK (preferred_variant IN ('standard', 'extended')),
    avatar_url VARCHAR(255),
    sound_enabled BOOLEAN DEFAULT TRUE,
    animations_enabled BOOLEAN DEFAULT TRUE,

    -- Constraints
    CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT wins_not_exceed_played_trader CHECK (games_won_trader <= games_played_trader),
    CONSTRAINT wins_not_exceed_played_investor CHECK (games_won_investor <= games_played_investor),
    CONSTRAINT wins_not_exceed_played_strategist CHECK (games_won_strategist <= games_played_strategist)
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Composite index for leaderboards
CREATE INDEX idx_users_stats ON users(highest_net_worth DESC, games_played_trader, games_played_investor, games_played_strategist);

-- Comments
COMMENT ON TABLE users IS 'User accounts with game statistics, unlocks, and preferences';
COMMENT ON COLUMN users.investor_unlocked IS 'Unlocked after completing 5 Trader mode games';
COMMENT ON COLUMN users.strategist_unlocked IS 'Unlocked after completing 5 Investor mode games';
COMMENT ON COLUMN users.highest_net_worth IS 'Highest net worth achieved across all games in rupees';
COMMENT ON COLUMN users.preferred_variant IS 'Standard (2-6 players) or Extended (7-12 players)';
