# Fix Sign-In Issue - Quick Guide

## Problem
You can't sign in with other emails because profiles aren't being created properly.

## Solution
I've implemented TWO fallback mechanisms:

---

## Option 1: Database Trigger (Recommended)

Apply the updated migration that auto-creates profiles when users sign up.

### Steps:

1. **Open Supabase Dashboard** → SQL Editor

2. **Run Migration 008** (if not done yet):
   - Copy from: `supabase/migrations/008_lobby_system_updates_fixed.sql`
   - Paste and Run

3. **Run Migration 009** (Updated with better username handling):
   - Copy from: `supabase/migrations/009_fix_user_references.sql`
   - Paste and Run

**What it does:**
- Creates `game_profiles` table
- Trigger automatically creates profile on signup
- Handles duplicate usernames (adds numbers: John, John2, John3)
- Never blocks sign-in even if profile creation fails

---

## Option 2: Simpler Alternative

If Migration 009 is giving you trouble, use the simpler version:

1. **Open Supabase Dashboard** → SQL Editor

2. **Run the Simple Migration**:
   - Copy from: `supabase/migrations/009_alternative_simple.sql`
   - Paste and Run

**What it does:**
- Just fixes foreign keys to point to `auth.users`
- Creates basic `game_profiles` table
- No automatic trigger (relies on client-side fallback below)

---

## Client-Side Fallback (Already Added!)

I've updated `AuthContext.tsx` to automatically create profiles on the client side if they don't exist.

**How it works:**
```
User signs in
    ↓
Check if profile exists
    ↓
If NO → Create profile automatically
    ↓
Use their Google name or email as username
```

This means even if the database trigger fails, the profile will still be created when they use the app!

---

## Testing Steps

### Test 1: Sign in with your current account
```bash
npm run dev
```
1. Sign in
2. Check browser console - should see no errors
3. Go to Supabase Dashboard → Table Editor → `game_profiles`
4. You should see your profile

### Test 2: Sign in with a different email
1. Sign out
2. Sign in with different Google account
3. Profile should be created automatically
4. Check `game_profiles` table - should have both users

### Test 3: Create a game
1. Click "Play Now"
2. Click "Create Game"
3. Configure settings and create
4. Should work without foreign key errors

---

## What Changed

### ✅ Updated Files:

1. **`AuthContext.tsx`**
   - Added `ensureProfile()` function
   - Automatically creates profile on sign-in
   - Runs every time user authenticates

2. **`GameLobby.tsx`**
   - Changed `users` → `game_profiles`

3. **`GameWaitingRoom.tsx`**
   - Changed `users` → `game_profiles`

4. **`009_fix_user_references.sql`**
   - Improved username generation
   - Handles duplicates
   - Better error handling

---

## Troubleshooting

### Still can't sign in?

**Check 1: Is `game_profiles` table created?**
- Dashboard → Table Editor → Should see `game_profiles`

**Check 2: Are foreign keys correct?**
```sql
-- Run this in SQL Editor to check:
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('games', 'game_players');
```

Expected output:
- `games.host_user_id` → `auth.users(id)`
- `games.winner_user_id` → `auth.users(id)`
- `game_players.user_id` → `auth.users(id)`

**Check 3: Browser console errors?**
- Open Developer Tools → Console
- Look for errors when signing in
- Share the error message

---

## Manual Profile Creation

If all else fails, manually create a profile:

```sql
-- Replace YOUR_USER_ID with your actual auth user ID
INSERT INTO game_profiles (user_id, username)
VALUES ('YOUR_USER_ID', 'YourUsername');
```

To find your user ID:
1. Dashboard → Authentication → Users
2. Copy the ID column

---

## Current Status

✅ Code updated with client-side fallback
✅ Migration improved with duplicate handling
✅ Build successful
✅ Ready to test

## Next Steps

1. Apply one of the migrations (Option 1 or 2)
2. Run `npm run dev`
3. Try signing in with different account
4. Should work automatically!

---

## Need Help?

If you still have issues:
1. Check browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Share the specific error message

The client-side fallback should handle most cases even if the database trigger fails! 🎉
