-- ============================================
-- Enable RLS and Add Policies for games and game_players
-- ============================================

-- Enable Row Level Security on games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on game_players table
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GAMES TABLE POLICIES
-- ============================================

-- Anyone can view games (needed for lobby and joining)
CREATE POLICY "Anyone can view games"
ON games FOR SELECT
USING (true);

-- Authenticated users can create games
CREATE POLICY "Authenticated users can create games"
ON games FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Host can update their own games
CREATE POLICY "Host can update their games"
ON games FOR UPDATE
USING (auth.uid() = host_user_id);

-- Host can delete their own games
CREATE POLICY "Host can delete their games"
ON games FOR DELETE
USING (auth.uid() = host_user_id);

-- ============================================
-- GAME_PLAYERS TABLE POLICIES
-- ============================================

-- Anyone can view game players (needed to see who's in the game)
CREATE POLICY "Anyone can view game players"
ON game_players FOR SELECT
USING (true);

-- Authenticated users can join games (insert themselves as players)
CREATE POLICY "Users can join games"
ON game_players FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Players can update their own player record OR host can update any player in their game
CREATE POLICY "Players and host can update game_players"
ON game_players FOR UPDATE
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM games
        WHERE games.game_id = game_players.game_id
        AND games.host_user_id = auth.uid()
    )
);

-- Players can delete themselves from games
CREATE POLICY "Players can leave games"
ON game_players FOR DELETE
USING (auth.uid() = user_id);

-- Host can delete any player from their game
CREATE POLICY "Host can remove players from their game"
ON game_players FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM games
        WHERE games.game_id = game_players.game_id
        AND games.host_user_id = auth.uid()
    )
);

-- ============================================
-- DONE! RLS policies added
-- ============================================
