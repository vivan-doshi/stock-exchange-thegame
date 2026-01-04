-- =================================================================
-- COMPLETE REPAIR SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX ALL PERMISSION ISSUES
-- =================================================================

-- 1. TEMPORARILY DISABLE RLS TO PREVENT LOCKOUTS
-- =================================================================
ALTER TABLE game_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_players DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON game_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON game_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON game_profiles;

DROP POLICY IF EXISTS "Everyone can view public games" ON games;
DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
DROP POLICY IF EXISTS "Hosts can update their games" ON games;

DROP POLICY IF EXISTS "Everyone can view game players" ON game_players;
DROP POLICY IF EXISTS "Authenticated users can join games" ON game_players;
DROP POLICY IF EXISTS "Players can update their own status" ON game_players;

-- 3. FIX TABLE SCHEMAS AND CONSTRAINTS (IF MISSING)
-- =================================================================

-- Ensure games table columns exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'trader';
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_variant VARCHAR(20) DEFAULT 'standard';
ALTER TABLE games ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'waiting';

-- Ensure foreign keys are correct
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_host_user_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_host_user_id_fkey 
    FOREIGN KEY (host_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. RE-ENABLE RLS WITH CORRECT POLICIES
-- =================================================================

-- A. GAME PROFILES
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read profiles (needed for leaderboards/lobbies)
CREATE POLICY "Public profiles access" 
ON game_profiles FOR SELECT 
USING (true);

-- Allow users to create their own profile
CREATE POLICY "Users can create own profile" 
ON game_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON game_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- B. GAMES
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow everyone to see public games (or all games for simplicity in MVP)
CREATE POLICY "Public games access" 
ON games FOR SELECT 
USING (true);

-- Allow authenticated users to create a game (must be host)
CREATE POLICY "Auth users can create games" 
ON games FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = host_user_id);

-- Allow host to update game (e.g. start game, change settings)
CREATE POLICY "Hosts can update own games" 
ON games FOR UPDATE 
USING (auth.uid() = host_user_id);

-- C. GAME PLAYERS
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Allow everyone to see who is in a game
CREATE POLICY "Public player list access" 
ON game_players FOR SELECT 
USING (true);

-- Allow users to join a game (insert themselves)
CREATE POLICY "Users can join games" 
ON game_players FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their status (e.g. ready up)
CREATE POLICY "Users can update own player status" 
ON game_players FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow host to remove players (optional, useful for kicking)
CREATE POLICY "Host can manage players" 
ON game_players FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM games 
        WHERE games.game_id = game_players.game_id 
        AND games.host_user_id = auth.uid()
    )
);

-- 5. VERIFICATION HELPER
-- =================================================================
-- (Optional) If you want to check if it worked
SELECT 'SUCCESS: All policies applied' as status;
