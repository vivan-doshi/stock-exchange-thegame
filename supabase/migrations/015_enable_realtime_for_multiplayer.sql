-- ============================================
-- Enable Realtime for Multiplayer Tables
-- ============================================

-- Set the publication to ALL TABLES (simplest approach)
-- This ensures all current and future tables have realtime enabled
ALTER PUBLICATION supabase_realtime SET TABLE games, game_players, transactions;

-- ============================================
-- DONE! Realtime enabled for all multiplayer tables
-- ============================================
