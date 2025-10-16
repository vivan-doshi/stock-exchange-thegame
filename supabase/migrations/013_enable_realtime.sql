-- ============================================
-- Enable Realtime for games and game_players tables
-- ============================================

-- Enable realtime on games table
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Enable realtime on game_players table
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;

-- ============================================
-- DONE! Realtime enabled
-- ============================================
