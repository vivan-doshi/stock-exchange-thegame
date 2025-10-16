-- Lobby System Updates
-- Adds necessary columns for game lobby functionality

-- First, update the current_round constraint to allow 0 for waiting games
ALTER TABLE games
DROP CONSTRAINT games_current_round_check;

ALTER TABLE games
ADD CONSTRAINT games_current_round_check CHECK (current_round >= 0 AND current_round <= 10);

-- Update the default for current_round to 0
ALTER TABLE games
ALTER COLUMN current_round SET DEFAULT 0;

-- Update the current_transaction constraint to allow 0 for waiting games
ALTER TABLE games
DROP CONSTRAINT games_current_transaction_check;

ALTER TABLE games
ADD CONSTRAINT games_current_transaction_check CHECK (current_transaction >= 0 AND current_transaction <= 3);

-- Update the default for current_transaction to 0
ALTER TABLE games
ALTER COLUMN current_transaction SET DEFAULT 0;

-- Add missing columns to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS host_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS max_players INTEGER;

-- Update max_players based on player_count if not set
UPDATE games
SET max_players = player_count
WHERE max_players IS NULL;

-- Make max_players required going forward (only if column exists and has no nulls)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM games WHERE max_players IS NULL
    ) THEN
        ALTER TABLE games ALTER COLUMN max_players SET NOT NULL;
    END IF;
END $$;

-- Add index for host lookups
CREATE INDEX IF NOT EXISTS idx_games_host ON games(host_user_id);
CREATE INDEX IF NOT EXISTS idx_games_public ON games(is_public) WHERE is_public = TRUE;

-- Add missing columns to game_players table
ALTER TABLE game_players
ADD COLUMN IF NOT EXISTS is_ready BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_host BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for ready status
CREATE INDEX IF NOT EXISTS idx_game_players_ready ON game_players(game_id, is_ready);

-- Comments
COMMENT ON COLUMN games.host_user_id IS 'User who created and hosts the game';
COMMENT ON COLUMN games.is_public IS 'Whether the game appears in public lobby (true) or is invite-only (false)';
COMMENT ON COLUMN games.max_players IS 'Maximum number of players allowed (2-6 for standard, 7-12 for extended)';
COMMENT ON COLUMN game_players.is_ready IS 'Whether player has marked themselves as ready in waiting room';
COMMENT ON COLUMN game_players.is_host IS 'Whether this player is the game host';
COMMENT ON COLUMN games.current_round IS 'Current round: 0 = waiting/lobby, 1-10 = active game rounds';
COMMENT ON COLUMN games.current_transaction IS 'Current transaction: 0 = waiting/lobby, 1-3 = transactions per round';

-- Update constraint to allow any player count within variant limits
ALTER TABLE games
DROP CONSTRAINT player_count_variant_check;

ALTER TABLE games
ADD CONSTRAINT player_count_variant_check CHECK (
    (game_variant = 'standard' AND player_count >= 2 AND player_count <= 6 AND max_players >= 2 AND max_players <= 6) OR
    (game_variant = 'extended' AND player_count >= 2 AND player_count <= 12 AND max_players >= 7 AND max_players <= 12)
);

-- Function to ensure host is marked correctly
CREATE OR REPLACE FUNCTION ensure_host_player()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the first player for a game, check if they should be host
    IF (SELECT COUNT(*) FROM game_players WHERE game_id = NEW.game_id) = 1 THEN
        -- Check if this user is the host
        IF (SELECT host_user_id FROM games WHERE game_id = NEW.game_id) = NEW.user_id THEN
            NEW.is_host := TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_host_player_trigger ON game_players;

-- Trigger to ensure host is marked
CREATE TRIGGER ensure_host_player_trigger
    BEFORE INSERT ON game_players
    FOR EACH ROW
    EXECUTE FUNCTION ensure_host_player();
