# Fix Sign-In Issue - FOLLOW THESE STEPS

## The Problem
You can't sign in with a second Google account because the database trigger to auto-create profiles is missing.

## The Solution

### Step 1: Run COMPLETE_FIX_NOW.sql
1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file `COMPLETE_FIX_NOW.sql` from this project
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**
7. You should see:
   - ✅ "OK: game_profiles table exists"
   - A list of 3 policies (Allow all to view, Allow authenticated to insert, Allow users to update)
   - Trigger info showing "on_auth_user_created"

### Step 2: Test the Fix
1. **Sign out** from your current account in the app
2. Go to `http://localhost:5173/debug`
3. Click **"Test RLS Policies"**
4. You should see:
   - ✅ SELECT works
   - ✅ INSERT works

### Step 3: Test Multi-Account Sign-In
1. Go back to `http://localhost:5173/login`
2. Sign in with a **different Google account**
3. The profile should be created automatically
4. You should be redirected to the home page

### Step 4: Verify It Worked
1. Go to Supabase Dashboard → **Table Editor** → `game_profiles`
2. You should see profiles for BOTH Google accounts

## If It Still Doesn't Work

Go to `/debug` page and check the logs for specific error messages. The most common issues are:

1. **"RLS POLICY BLOCKING INSERT"** - RLS policies still wrong
   - Solution: Run COMPLETE_FIX_NOW.sql again

2. **"duplicate key value violates unique constraint"** - Profile already exists but with wrong data
   - Solution: Delete the row in `game_profiles` table and try again

3. **"foreign key constraint"** - User doesn't exist in auth.users
   - Solution: This shouldn't happen, but if it does, check Supabase Auth dashboard

## What COMPLETE_FIX_NOW.sql Does

1. **Fixes RLS policies** - Allows authenticated users to insert their own profile
2. **Creates database trigger** - Automatically creates a profile when a new user signs in
3. **Handles username conflicts** - If username already exists, adds a number (e.g., "John1", "John2")
4. **Verifies setup** - Shows you what policies and triggers exist

## Next Steps After Fix

Once sign-in works with multiple accounts, we'll add:
- Custom username input
- Display name field (optional)
- Profile customization page
