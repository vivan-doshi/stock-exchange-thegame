# 🔍 Debug Sign-In Issues - Step by Step

## Quick Diagnosis Tool

I've created a debug page to help diagnose the sign-in issue!

### **Access the Debug Page:**

```bash
npm run dev
```

Then navigate to: **http://localhost:5173/debug**

---

## 🎯 Step-by-Step Troubleshooting

### **Step 1: Verify Migration Ran**

1. Open **Supabase Dashboard** → **Table Editor**
2. Check if **`game_profiles`** table exists
3. If NOT: Run `APPLY_THIS_NOW.sql` in SQL Editor

### **Step 2: Use Debug Page**

1. Go to **http://localhost:5173/debug**
2. Sign in with your Google account
3. Check what the debug page shows:

**Scenario A: User Info shows, but Profile section says "No profile found"**
- Click "Create Profile" button
- Check logs for any errors
- If you see "permission denied" → RLS issue (see Step 3)
- If you see "duplicate key" → Username conflict (see Step 4)

**Scenario B: Can't even sign in**
- Check browser console (F12) for errors
- Check if Supabase URL/Keys are correct in `.env.local`

**Scenario C: Profile exists but shows wrong username**
- This is fine! The profile was created
- You can update it later

### **Step 3: Fix RLS (Row Level Security) Issues**

If you see "permission denied" errors:

```sql
-- Run this in Supabase SQL Editor:

-- First, check current policies
SELECT * FROM pg_policies WHERE tablename = 'game_profiles';

-- Drop all policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;

-- Recreate with correct permissions
CREATE POLICY "Anyone can view profiles" ON game_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON game_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON game_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### **Step 4: Fix Username Conflicts**

If you see "duplicate key violation for username":

**Option A: Generate unique username**
```sql
-- Replace YOUR_USER_ID with your actual auth user ID (from debug page)
INSERT INTO game_profiles (user_id, username)
VALUES (
  'YOUR_USER_ID',
  'Player_' || substring(replace('YOUR_USER_ID'::text, '-', ''), 1, 8)
);
```

**Option B: Drop and recreate with unique constraint removed**
```sql
-- Only do this if you want to allow duplicate usernames
ALTER TABLE game_profiles DROP CONSTRAINT IF EXISTS game_profiles_username_key;
```

### **Step 5: Manually Create Profile**

If automatic creation keeps failing, create manually:

1. Get your user ID from the debug page
2. Run in SQL Editor:

```sql
INSERT INTO game_profiles (user_id, username, avatar_url)
VALUES (
  'YOUR_USER_ID_HERE',
  'YourUsername',
  'https://example.com/avatar.jpg'  -- optional
);
```

### **Step 6: Check Supabase Logs**

1. Dashboard → **Logs** → **Postgres Logs**
2. Look for errors when you try to sign in
3. Common errors:
   - `violates foreign key constraint` → Migration not run
   - `permission denied` → RLS issue
   - `duplicate key` → Username conflict

---

## 🔧 Common Issues & Solutions

### **Issue 1: "relation game_profiles does not exist"**

**Solution:**
```sql
-- Run APPLY_THIS_NOW.sql in SQL Editor
```

### **Issue 2: "new row violates row-level security policy"**

**Solution:**
- RLS is blocking the insert
- Run the RLS fix from Step 3 above
- Make sure you're signed in (auth.uid() must return a value)

### **Issue 3: "duplicate key value violates unique constraint"**

**Cause:** Username already exists

**Solution:**
```sql
-- Check existing usernames
SELECT user_id, username FROM game_profiles;

-- Delete the duplicate if it's yours
DELETE FROM game_profiles WHERE user_id = 'YOUR_USER_ID';

-- Then try signing in again
```

### **Issue 4: "Cannot sign in with different Google account"**

**Steps:**
1. Sign out completely
2. Clear browser cookies/cache
3. Go to `/debug` page
4. Sign in with the other account
5. Check if profile gets created
6. If not, use "Create Profile" button on debug page

### **Issue 5: Profile created but can't create games**

**Cause:** Foreign key still pointing to old `users` table

**Solution:**
```sql
-- Check current foreign keys
SELECT conname FROM pg_constraint
WHERE conrelid = 'games'::regclass
  AND contype = 'f';

-- If you see games_user_id_fkey instead of games_host_user_id_fkey:
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_user_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_host_user_id_fkey
  FOREIGN KEY (host_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

## 📊 What to Check in Supabase Dashboard

### **1. Authentication Tab**
- Go to: **Authentication** → **Users**
- You should see all Google accounts that signed in
- Copy the `id` (this is the user_id you need)

### **2. Table Editor Tab**
- Go to: **Table Editor** → **game_profiles**
- Should have a row for each signed-in user
- Check `user_id` matches auth user `id`

### **3. SQL Editor Tab**
Run these diagnostic queries:

```sql
-- Check all profiles
SELECT * FROM game_profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'game_profiles';

-- Check foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('games', 'game_players');
```

---

## 🎯 Testing Procedure

After fixing issues, test in this order:

1. **Test Database Connection:**
   - Go to `/debug`
   - Click "Test Database" button
   - Should say "Database connection OK"

2. **Test Profile Check:**
   - Click "Refresh Profile"
   - Should show green "Profile exists"
   - If not, click "Create Profile"

3. **Test Game Creation:**
   - Go to home page
   - Click "Play Now"
   - Click "Create Game"
   - Should work without errors

4. **Test Second Account:**
   - Open incognito window
   - Sign in with different Google account
   - Go to `/debug`
   - Profile should auto-create
   - If not, click "Create Profile"

---

## 🚨 Emergency Reset

If everything is broken, reset the profiles table:

```sql
-- CAREFUL: This deletes all profiles!
DROP TABLE IF EXISTS game_profiles CASCADE;

-- Then run APPLY_THIS_NOW.sql again
```

---

## ✅ Success Criteria

You know it's working when:
- ✅ Debug page shows your user info
- ✅ Debug page shows "Profile exists"
- ✅ Can create games without errors
- ✅ Can sign in with multiple Google accounts
- ✅ Each account gets a unique profile

---

## 📝 What to Send Me If Still Stuck

1. Screenshot of `/debug` page
2. Error message from browser console (F12)
3. Output of this SQL query:
```sql
SELECT
  (SELECT COUNT(*) FROM game_profiles) as profile_count,
  (SELECT COUNT(*) FROM auth.users) as auth_user_count;
```
4. Any error from Supabase Logs

---

## 🎉 Once It Works

After you can sign in with multiple accounts:
1. Delete the debug route (optional)
2. Remove `/debug` from App.tsx (optional)
3. Start testing the actual game lobby!

The debug page will stay there if you need it later for troubleshooting.
