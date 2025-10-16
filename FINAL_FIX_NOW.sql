-- ============================================
-- FINAL FIX FOR SIGN-IN ISSUES
-- This version checks if profile exists before creating
-- ============================================

-- Step 1: Verify table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'game_profiles') THEN
        RAISE EXCEPTION 'game_profiles table does not exist! Run APPLY_THIS_NOW.sql first!';
    ELSE
        RAISE NOTICE 'OK: game_profiles table exists';
    END IF;
END $$;

-- Step 2: Fix RLS Policies
ALTER TABLE game_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON game_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON game_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON game_profiles;
DROP POLICY IF EXISTS "Allow all to view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their profile" ON game_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON game_profiles;

-- Re-enable RLS
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Create correct PERMISSIVE policies
CREATE POLICY "Allow all to view profiles"
ON game_profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to insert their profile"
ON game_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own profile"
ON game_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 3: Create IMPROVED trigger function that checks for existing profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username TEXT;
    v_counter INTEGER := 0;
    v_base_username TEXT;
    v_profile_exists BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS (
        SELECT 1 FROM public.game_profiles WHERE user_id = NEW.id
    ) INTO v_profile_exists;

    -- If profile already exists, skip creation
    IF v_profile_exists THEN
        RAISE NOTICE 'Profile already exists for user %', NEW.id;
        RETURN NEW;
    END IF;

    -- Generate base username from user metadata
    v_base_username := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1),
        'Player_' || SUBSTRING(NEW.id::TEXT, 1, 8)
    );

    v_username := v_base_username;

    -- Handle duplicate usernames
    WHILE EXISTS (SELECT 1 FROM public.game_profiles WHERE username = v_username) LOOP
        v_counter := v_counter + 1;
        v_username := v_base_username || v_counter;
    END LOOP;

    -- Insert profile
    INSERT INTO public.game_profiles (user_id, username, avatar_url)
    VALUES (
        NEW.id,
        v_username,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    RAISE NOTICE 'Created profile for user % with username %', NEW.id, v_username;
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile was created by another process, that's OK
        RAISE NOTICE 'Profile already exists (race condition) for user %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Step 5: Create profiles for any existing users that don't have one
DO $$
DECLARE
    v_user RECORD;
    v_username TEXT;
    v_counter INTEGER;
    v_base_username TEXT;
BEGIN
    FOR v_user IN
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.game_profiles gp ON au.id = gp.user_id
        WHERE gp.user_id IS NULL
    LOOP
        -- Generate base username
        v_base_username := COALESCE(
            v_user.raw_user_meta_data->>'full_name',
            SPLIT_PART(v_user.email, '@', 1),
            'Player_' || SUBSTRING(v_user.id::TEXT, 1, 8)
        );

        v_username := v_base_username;
        v_counter := 0;

        -- Handle duplicate usernames
        WHILE EXISTS (SELECT 1 FROM public.game_profiles WHERE username = v_username) LOOP
            v_counter := v_counter + 1;
            v_username := v_base_username || v_counter;
        END LOOP;

        -- Insert profile
        INSERT INTO public.game_profiles (user_id, username, avatar_url)
        VALUES (
            v_user.id,
            v_username,
            COALESCE(v_user.raw_user_meta_data->>'avatar_url', '')
        );

        RAISE NOTICE 'Created missing profile for existing user % with username %', v_user.id, v_username;
    END LOOP;
END $$;

-- Step 6: Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'game_profiles'
ORDER BY policyname;

-- Step 7: Verify trigger was created
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Step 8: Show all profiles
SELECT user_id, username, created_at FROM game_profiles ORDER BY created_at DESC;

-- ============================================
-- DONE! Now:
-- 1. Sign out from your app
-- 2. Sign in with ANY Google account (including new ones)
-- 3. Profile will be created automatically if it doesn't exist
-- 4. Go to /debug and verify with "Test RLS Policies"
-- ============================================
