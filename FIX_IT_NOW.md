# 🚨 FIX PROFILE CREATION - DO THIS NOW

## The Issue
You can't create profiles because of RLS (Row Level Security) policy issues.

---

## ✅ STEP 1: Run Your App

```bash
npm run dev
```

## ✅ STEP 2: Go to Debug Page

Open: **http://localhost:5173/debug**

## ✅ STEP 3: Click "Test RLS Policies"

This will tell you exactly what's wrong!

**Look for:**
- ❌ "RLS POLICY BLOCKING INSERT!" → Go to Step 4
- ✅ "INSERT works" → Go to Step 5

---

## ✅ STEP 4: Fix RLS Policies (If Needed)

### Open Supabase Dashboard → SQL Editor

### Copy and Run This (FIX_RLS_NOW.sql):

```sql
-- Disable RLS temporarily
ALTER TABLE game_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON game_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON game_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON game_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON game_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON game_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON game_profiles;

-- Re-enable RLS
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Create CORRECT policies
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
```

---

## ✅ STEP 5: Test Again

1. Go back to `/debug` page
2. Click "Test RLS Policies" again
3. Should see: ✅ "INSERT works"
4. Click "Create Profile" button
5. Should work!

---

## ✅ STEP 6: Verify

- Go to Supabase Dashboard → Table Editor → `game_profiles`
- You should see your profile!
- Username should be your Google name or email

---

## 🎯 If Still Not Working

### Check the Logs on Debug Page

Look for specific errors:

### Error 1: "permission denied for table game_profiles"
**Fix:** RLS is still blocking. Run Step 4 again.

### Error 2: "duplicate key value violates unique constraint"
**Fix:** Profile already exists! Just refresh the page.

### Error 3: "relation game_profiles does not exist"
**Fix:** Table doesn't exist. Run `APPLY_THIS_NOW.sql` first.

### Error 4: "new row violates foreign key constraint"
**Fix:** Your auth user doesn't exist. Sign out and sign in again.

---

## 🚀 Quick Test

After fixing, test with another account:

1. Open incognito window
2. Go to: http://localhost:5173/debug
3. Sign in with different Google account
4. Click "Test RLS Policies"
5. Should see ✅ "INSERT works"
6. Click "Create Profile"
7. Should work immediately!

---

## 📝 What the Debug Page Shows

### User Info Section
- ✅ Shows your Google account details
- ✅ Shows your user ID (copy this if needed)

### Profile Info Section
- ✅ Green checkmark if profile exists
- ⚠️ Yellow warning if no profile
- ❌ Red error with details if something wrong

### Logs Section
- 📋 Real-time log of every action
- 🔍 Shows exact error messages
- 💡 Suggests fixes automatically

---

## 🎉 Success Looks Like

```
Testing RLS policies...
Current user ID: abc-123-def-456
✅ SELECT works (found 0 profiles)
✅ INSERT works
🧹 Cleaned up test profile
```

Then when you click "Create Profile":
```
Attempting to create profile...
Username will be: YourName
Profile created successfully: {...}
```

---

## 💡 Why This Happens

RLS (Row Level Security) protects your database. But if policies are configured wrong, they block legitimate inserts.

The fix:
1. Policies allow INSERT only if `auth.uid() = user_id`
2. Must be signed in as `authenticated` user
3. Must match your actual auth user ID

---

## ⚡ Super Quick Fix (If Desperate)

Temporarily disable RLS completely:

```sql
ALTER TABLE game_profiles DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** This makes the table publicly writable. Only use for testing! Re-enable with proper policies after.

---

## 📞 Still Stuck?

Copy this info and send to me:

1. Screenshot of debug page logs
2. Output of this SQL query:
```sql
SELECT * FROM pg_policies WHERE tablename = 'game_profiles';
```
3. Error message from "Test RLS Policies" button

---

## 🎯 Bottom Line

1. Run app: `npm run dev`
2. Go to: `http://localhost:5173/debug`
3. Click: "Test RLS Policies"
4. If ❌: Run `FIX_RLS_NOW.sql` in Supabase
5. Test again
6. Should work! 🎉
