-- ============================================
-- FIX RLS (Row Level Security) POLICIES
-- Run this if you can't create profiles
-- ============================================

-- Step 1: Check if table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'game_profiles') THEN
        RAISE NOTICE 'ERROR: game_profiles table does not exist! Run APPLY_THIS_NOW.sql first!';
    ELSE
        RAISE NOTICE 'OK: game_profiles table exists';
    END IF;
END $$;

-- Step 2: Disable RLS temporarily to test
ALTER TABLE game_profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON game_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON game_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON game_profiles;

-- Step 4: Re-enable RLS
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create PERMISSIVE policies (these allow access)
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

-- Step 6: Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'game_profiles';

-- ============================================
-- DONE! Now try creating profile again
-- ============================================
