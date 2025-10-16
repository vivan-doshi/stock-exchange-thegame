-- ============================================
-- COMPLETE FIX FOR SIGN-IN ISSUES
-- This adds the missing trigger to auto-create profiles
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

-- Step 2: Fix RLS Policies (from FIX_RLS_NOW.sql)
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

-- Step 3: Create trigger function for auto-profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username TEXT;
    v_counter INTEGER := 0;
    v_base_username TEXT;
BEGIN
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

    RETURN NEW;
EXCEPTION
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

-- Step 5: Verify policies were created
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

-- Step 6: Verify trigger was created
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- DONE! Now:
-- 1. Sign out from your app
-- 2. Sign in with the other Google account
-- 3. Profile should be created automatically
-- 4. If it still fails, go to /debug and click "Test RLS Policies"
-- ============================================
