-- Fix User References to use Supabase Auth
-- This migration updates the schema to properly reference auth.users instead of the custom users table

-- First, let's check if we should keep the custom users table or merge with auth.users
-- For this game, we'll create a profile table that extends auth.users

-- Drop the old users table if it exists (only if empty or you want to start fresh)
-- UNCOMMENT THIS LINE ONLY IF YOU WANT TO DROP THE OLD TABLE:
-- DROP TABLE IF EXISTS users CASCADE;

-- Create a game_profiles table that extends auth.users
CREATE TABLE IF NOT EXISTS game_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,

    -- Game Statistics (Trader Mode)
    games_played_trader INTEGER DEFAULT 0 CHECK (games_played_trader >= 0),
    games_won_trader INTEGER DEFAULT 0 CHECK (games_won_trader >= 0),

    -- Game Statistics (Investor Mode)
    games_played_investor INTEGER DEFAULT 0 CHECK (games_played_investor >= 0),
    games_won_investor INTEGER DEFAULT 0 CHECK (games_won_investor >= 0),

    -- Game Statistics (Strategist Mode)
    games_played_strategist INTEGER DEFAULT 0 CHECK (games_played_strategist >= 0),
    games_won_strategist INTEGER DEFAULT 0 CHECK (games_won_strategist >= 0),

    -- Records
    highest_net_worth INTEGER DEFAULT 0 CHECK (highest_net_worth >= 0),

    -- Mode Unlocks
    investor_unlocked BOOLEAN DEFAULT FALSE,
    strategist_unlocked BOOLEAN DEFAULT FALSE,

    -- User Preferences
    preferred_mode VARCHAR(20) DEFAULT 'trader' CHECK (preferred_mode IN ('trader', 'investor', 'strategist')),
    preferred_variant VARCHAR(20) DEFAULT 'standard' CHECK (preferred_variant IN ('standard', 'extended')),
    avatar_url VARCHAR(255),
    sound_enabled BOOLEAN DEFAULT TRUE,
    animations_enabled BOOLEAN DEFAULT TRUE,

    -- Constraints
    CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT wins_not_exceed_played_trader CHECK (games_won_trader <= games_played_trader),
    CONSTRAINT wins_not_exceed_played_investor CHECK (games_won_investor <= games_played_investor),
    CONSTRAINT wins_not_exceed_played_strategist CHECK (games_won_strategist <= games_played_strategist)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_profiles_username ON game_profiles(username);
CREATE INDEX IF NOT EXISTS idx_game_profiles_created_at ON game_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_game_profiles_last_login ON game_profiles(last_login);

-- Enable Row Level Security
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;

-- Create policies for game_profiles
CREATE POLICY "Users can view all profiles" ON game_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON game_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON game_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- Start with full name or email prefix
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
    );

    -- Make sure username is at least 3 characters
    IF LENGTH(v_username) < 3 THEN
        v_username := 'Player_' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;

    -- If username exists, add a number suffix
    WHILE EXISTS (SELECT 1 FROM game_profiles WHERE username = v_username) LOOP
        v_counter := v_counter + 1;
        v_username := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            SPLIT_PART(NEW.email, '@', 1)
        ) || v_counter;
    END LOOP;

    -- Insert the profile
    INSERT INTO game_profiles (user_id, username, avatar_url)
    VALUES (
        NEW.id,
        v_username,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If anything fails, still return NEW so auth doesn't fail
        RAISE WARNING 'Failed to create game profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Now update the games table foreign key to reference auth.users
-- First, drop the old constraint if it exists
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_host_user_id_fkey;

-- Add new constraint referencing auth.users
ALTER TABLE games
ADD CONSTRAINT games_host_user_id_fkey
FOREIGN KEY (host_user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update game_players table to reference auth.users
ALTER TABLE game_players DROP CONSTRAINT IF EXISTS game_players_user_id_fkey;

ALTER TABLE game_players
ADD CONSTRAINT game_players_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update winner reference in games table
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_winner_user_id_fkey;

ALTER TABLE games
ADD CONSTRAINT games_winner_user_id_fkey
FOREIGN KEY (winner_user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Comments
COMMENT ON TABLE game_profiles IS 'Extended user profiles with game statistics and preferences';
COMMENT ON COLUMN game_profiles.user_id IS 'References auth.users - the authenticated user ID from Supabase Auth';
