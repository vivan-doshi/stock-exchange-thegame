-- ALTERNATIVE SIMPLE VERSION
-- Use this if you're having issues with the complex migration

-- Step 1: Just update foreign key references to point to auth.users
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_host_user_id_fkey;
ALTER TABLE games
ADD CONSTRAINT games_host_user_id_fkey
FOREIGN KEY (host_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE game_players DROP CONSTRAINT IF EXISTS game_players_user_id_fkey;
ALTER TABLE game_players
ADD CONSTRAINT game_players_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_winner_user_id_fkey;
ALTER TABLE games
ADD CONSTRAINT games_winner_user_id_fkey
FOREIGN KEY (winner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Create simple profiles table (optional - for storing usernames)
CREATE TABLE IF NOT EXISTS game_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;

-- Allow anyone to read profiles (for displaying usernames in lobby)
CREATE POLICY "Anyone can view profiles" ON game_profiles FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON game_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON game_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_game_profiles_username ON game_profiles(username);
