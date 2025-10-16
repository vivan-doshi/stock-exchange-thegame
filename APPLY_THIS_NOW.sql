-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- This fixes all the sign-in and lobby issues
-- ============================================

-- PART 1: Fix constraints to allow lobby (round 0)
-- ============================================
ALTER TABLE games DROP CONSTRAINT games_current_round_check;
ALTER TABLE games ADD CONSTRAINT games_current_round_check CHECK (current_round >= 0 AND current_round <= 10);
ALTER TABLE games ALTER COLUMN current_round SET DEFAULT 0;

ALTER TABLE games DROP CONSTRAINT games_current_transaction_check;
ALTER TABLE games ADD CONSTRAINT games_current_transaction_check CHECK (current_transaction >= 0 AND current_transaction <= 3);
ALTER TABLE games ALTER COLUMN current_transaction SET DEFAULT 0;

-- PART 2: Add lobby columns
-- ============================================
ALTER TABLE games ADD COLUMN IF NOT EXISTS host_user_id UUID;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS max_players INTEGER;

UPDATE games SET max_players = player_count WHERE max_players IS NULL;

ALTER TABLE game_players ADD COLUMN IF NOT EXISTS is_ready BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE game_players ADD COLUMN IF NOT EXISTS is_host BOOLEAN DEFAULT FALSE NOT NULL;

-- PART 3: Fix foreign keys to point to auth.users
-- ============================================
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_host_user_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE game_players DROP CONSTRAINT IF EXISTS game_players_user_id_fkey;
ALTER TABLE game_players ADD CONSTRAINT game_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_winner_user_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_winner_user_id_fkey FOREIGN KEY (winner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- PART 4: Create game_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS game_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Game Statistics
    games_played_trader INTEGER DEFAULT 0 CHECK (games_played_trader >= 0),
    games_won_trader INTEGER DEFAULT 0 CHECK (games_won_trader >= 0),
    games_played_investor INTEGER DEFAULT 0 CHECK (games_played_investor >= 0),
    games_won_investor INTEGER DEFAULT 0 CHECK (games_won_investor >= 0),
    games_played_strategist INTEGER DEFAULT 0 CHECK (games_played_strategist >= 0),
    games_won_strategist INTEGER DEFAULT 0 CHECK (games_won_strategist >= 0),

    -- Records
    highest_net_worth INTEGER DEFAULT 0,

    -- Unlocks
    investor_unlocked BOOLEAN DEFAULT FALSE,
    strategist_unlocked BOOLEAN DEFAULT FALSE,

    -- Preferences
    preferred_mode VARCHAR(20) DEFAULT 'trader',
    preferred_variant VARCHAR(20) DEFAULT 'standard',
    avatar_url VARCHAR(255)
);

-- PART 5: Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_games_host ON games(host_user_id);
CREATE INDEX IF NOT EXISTS idx_games_public ON games(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_game_players_ready ON game_players(game_id, is_ready);
CREATE INDEX IF NOT EXISTS idx_game_profiles_username ON game_profiles(username);

-- PART 6: Enable RLS and create policies
-- ============================================
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;

CREATE POLICY "Anyone can view profiles" ON game_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON game_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON game_profiles FOR UPDATE USING (auth.uid() = user_id);

-- PART 7: Update player count constraint
-- ============================================
ALTER TABLE games DROP CONSTRAINT IF EXISTS player_count_variant_check;
ALTER TABLE games ADD CONSTRAINT player_count_variant_check CHECK (
    (game_variant = 'standard' AND player_count >= 2 AND player_count <= 6 AND max_players >= 2 AND max_players <= 6) OR
    (game_variant = 'extended' AND player_count >= 2 AND player_count <= 12 AND max_players >= 7 AND max_players <= 12)
);

-- PART 8: Create trigger to auto-mark host
-- ============================================
CREATE OR REPLACE FUNCTION ensure_host_player()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM game_players WHERE game_id = NEW.game_id) = 1 THEN
        IF (SELECT host_user_id FROM games WHERE game_id = NEW.game_id) = NEW.user_id THEN
            NEW.is_host := TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_host_player_trigger ON game_players;
CREATE TRIGGER ensure_host_player_trigger
    BEFORE INSERT ON game_players
    FOR EACH ROW
    EXECUTE FUNCTION ensure_host_player();

-- ============================================
-- DONE! Now you can:
-- 1. Run: npm run dev
-- 2. Sign in with any Google account
-- 3. Click "Play Now" to test the lobby
-- ============================================
