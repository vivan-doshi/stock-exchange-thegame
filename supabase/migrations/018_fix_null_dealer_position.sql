-- ============================================
-- Fix NULL dealer_position in existing games
-- ============================================

-- Some games were created before dealer_position was properly initialized
-- This migration ensures all games have a valid dealer_position value

UPDATE games
SET dealer_position = 1
WHERE dealer_position IS NULL;

-- Ensure current_player_position is also set for any games that might have missed it
UPDATE games
SET current_player_position = 1
WHERE current_player_position IS NULL;

-- Verify the fix (this SELECT is just for logging, won't affect the migration)
-- SELECT game_id, current_player_position, dealer_position
-- FROM games
-- WHERE status = 'in_progress';

-- ============================================
-- DONE! Fixed NULL dealer_position values
-- ============================================
