-- ============================================
-- COMPLETE FIX: Drop and recreate all RLS policies
-- ============================================

-- Drop all existing policies on games table
DROP POLICY IF EXISTS "Anyone can view games" ON games;
DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
DROP POLICY IF EXISTS "Host can update their games" ON games;
DROP POLICY IF EXISTS "Host can delete their games" ON games;

-- Drop all existing policies on game_players table
DROP POLICY IF EXISTS "Anyone can view game players" ON game_players;
DROP POLICY IF EXISTS "Users can join games" ON game_players;
DROP POLICY IF EXISTS "Players can update own record" ON game_players;
DROP POLICY IF EXISTS "Host can update players in their game" ON game_players;
DROP POLICY IF EXISTS "Players and host can update game_players" ON game_players;
DROP POLICY IF EXISTS "Players can leave games" ON game_players;
DROP POLICY IF EXISTS "Host can remove players from their game" ON game_players;

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GAMES TABLE POLICIES
-- ============================================

-- Anyone can view games
CREATE POLICY "games_select_policy"
ON games FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create games
CREATE POLICY "games_insert_policy"
ON games FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_user_id);

-- Host can update their own games
CREATE POLICY "games_update_policy"
ON games FOR UPDATE
TO authenticated
USING (auth.uid() = host_user_id)
WITH CHECK (auth.uid() = host_user_id);

-- Host can delete their own games
CREATE POLICY "games_delete_policy"
ON games FOR DELETE
TO authenticated
USING (auth.uid() = host_user_id);

-- ============================================
-- GAME_PLAYERS TABLE POLICIES
-- ============================================

-- Anyone can view game players
CREATE POLICY "game_players_select_policy"
ON game_players FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can join games
CREATE POLICY "game_players_insert_policy"
ON game_players FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Players can update their own record OR host can update any player
-- COMBINED into one policy to avoid conflicts
CREATE POLICY "game_players_update_policy"
ON game_players FOR UPDATE
TO authenticated
USING (
    -- Either you are the player
    auth.uid() = user_id
    OR
    -- Or you are the host of this game
    EXISTS (
        SELECT 1 FROM games
        WHERE games.game_id = game_players.game_id
        AND games.host_user_id = auth.uid()
    )
)
WITH CHECK (
    -- Same conditions for WITH CHECK
    auth.uid() = user_id
    OR
    EXISTS (
        SELECT 1 FROM games
        WHERE games.game_id = game_players.game_id
        AND games.host_user_id = auth.uid()
    )
);

-- Players can delete themselves OR host can delete any player
CREATE POLICY "game_players_delete_policy"
ON game_players FOR DELETE
TO authenticated
USING (
    -- Either you are the player
    auth.uid() = user_id
    OR
    -- Or you are the host of this game
    EXISTS (
        SELECT 1 FROM games
        WHERE games.game_id = game_players.game_id
        AND games.host_user_id = auth.uid()
    )
);

-- ============================================
-- DONE! All RLS policies properly configured
-- ============================================
