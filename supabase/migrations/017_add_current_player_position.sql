-- ============================================
-- Add current_player_position to games table
-- ============================================

-- Add new column to track whose turn it is (rotates each turn)
-- This is separate from dealer_position which stays fixed per round
ALTER TABLE games ADD COLUMN current_player_position INTEGER DEFAULT 1 CHECK (current_player_position >= 1);

-- Update existing games to set current_player_position = dealer_position
UPDATE games SET current_player_position = COALESCE(dealer_position, 1) WHERE current_player_position IS NULL;

-- Add comment
COMMENT ON COLUMN games.current_player_position IS 'Position of player whose turn it is (rotates each turn). Dealer stays fixed for the round.';
COMMENT ON COLUMN games.dealer_position IS 'Position of the dealer (stays fixed for entire round, rotates between rounds)';

-- ============================================
-- DONE! Added current_player_position column
-- ============================================
