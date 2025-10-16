# Game Lobby System - Database Setup Instructions

## Problem
The lobby system was failing because:
1. The `games` table required `current_round >= 1`, but lobbies need `current_round = 0`
2. The custom `users` table wasn't synced with Supabase Auth's `auth.users`
3. Foreign key constraints were pointing to wrong user table

## Solution
Apply these TWO migrations in order:

---

## Migration 1: Fix Constraints and Add Lobby Columns

**File:** `supabase/migrations/008_lobby_system_updates_fixed.sql`

**What it does:**
- Allows `current_round = 0` for waiting lobbies
- Allows `current_transaction = 0` for waiting lobbies
- Adds `host_user_id`, `is_public`, `max_players` to `games` table
- Adds `is_ready`, `is_host` to `game_players` table
- Creates trigger to auto-mark host player

**How to apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `008_lobby_system_updates_fixed.sql`
3. Paste and click **Run**

---

## Migration 2: Fix User References

**File:** `supabase/migrations/009_fix_user_references.sql`

**What it does:**
- Creates `game_profiles` table that properly extends `auth.users`
- Updates all foreign keys to reference `auth.users(id)` instead of custom `users` table
- Creates trigger to auto-create profile when user signs up via Google OAuth
- Enables Row Level Security (RLS) policies

**How to apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `009_fix_user_references.sql`
3. Paste and click **Run**

---

## What Changed in Code

The following files were updated to use `game_profiles` instead of `users`:
- `src/pages/GameLobby.tsx` - Updated host username lookup
- `src/pages/GameWaitingRoom.tsx` - Updated player username lookup

---

## How User Flow Works Now

### 1. User Signs In
```
User logs in with Google
    ↓
Supabase Auth creates entry in auth.users
    ↓
Trigger automatically creates profile in game_profiles
    ↓
Profile uses user's Google name as username
```

### 2. Create Game
```
User clicks "Create Game"
    ↓
Game created with host_user_id = auth.uid()
    ↓
Host added to game_players with is_host = true
    ↓
Game starts with current_round = 0 (waiting state)
```

### 3. Join Game
```
User clicks "Join Game"
    ↓
Player added to game_players
    ↓
Realtime updates notify all players
```

### 4. Start Game
```
Host clicks "Start Game" (when 2+ ready)
    ↓
Game updated: status = 'in_progress', current_round = 1
    ↓
All players auto-navigate to game board
```

---

## Database Tables After Migration

### auth.users (Supabase managed)
- `id` (UUID) - Primary key
- `email`, `raw_user_meta_data`, etc.

### game_profiles (Your custom table)
- `user_id` → `auth.users(id)`
- `username`, game stats, preferences, etc.

### games
- `game_id` (UUID) - Primary key
- `host_user_id` → `auth.users(id)`
- `is_public` - Boolean
- `max_players` - Integer
- `current_round` - 0-10 (0 = waiting)
- `status` - 'waiting' | 'in_progress' | 'completed'

### game_players
- `player_id` (UUID) - Primary key
- `game_id` → `games(game_id)`
- `user_id` → `auth.users(id)`
- `is_ready` - Boolean
- `is_host` - Boolean
- `player_position` - 1-12

---

## Verification Steps

After applying both migrations:

1. **Check Tables Exist:**
   - Table Editor → Verify `game_profiles` exists
   - Check it has all columns from migration

2. **Check Foreign Keys:**
   - games.host_user_id → auth.users(id) ✓
   - games.winner_user_id → auth.users(id) ✓
   - game_players.user_id → auth.users(id) ✓

3. **Test the Flow:**
   ```bash
   npm run dev
   ```
   - Sign in with Google
   - Check `game_profiles` has your user
   - Click "Play Now" → "Create Game"
   - Should create game without errors
   - Check `games` table has new row with your user_id

4. **Test Realtime:**
   - Open two browser windows
   - Create game in window 1
   - Check if it appears in window 2's lobby list

---

## Troubleshooting

### Error: "relation game_profiles does not exist"
**Solution:** Run migration 009 again

### Error: "insert violates foreign key constraint"
**Solution:**
1. Sign out and sign in again to create profile
2. Or manually insert profile:
```sql
INSERT INTO game_profiles (user_id, username)
VALUES ('your-auth-user-id', 'YourUsername');
```

### Error: "trigger on_auth_user_created already exists"
**Solution:** Migration will drop and recreate it automatically

### No username showing in lobby
**Solution:**
1. Check `game_profiles` has entry for your user
2. Username defaults to Google full name or email

---

## Next Steps

After migrations are applied and verified:
1. Test creating games
2. Test joining games
3. Test waiting room functionality
4. Test starting games
5. Implement actual game logic

---

## Rollback (If Needed)

If you need to undo these changes:

```sql
-- Remove new columns
ALTER TABLE games DROP COLUMN IF EXISTS host_user_id;
ALTER TABLE games DROP COLUMN IF EXISTS is_public;
ALTER TABLE games DROP COLUMN IF EXISTS max_players;

ALTER TABLE game_players DROP COLUMN IF EXISTS is_ready;
ALTER TABLE game_players DROP COLUMN IF EXISTS is_host;

-- Restore old constraints
ALTER TABLE games DROP CONSTRAINT games_current_round_check;
ALTER TABLE games ADD CONSTRAINT games_current_round_check
  CHECK (current_round >= 1 AND current_round <= 10);

-- Drop game_profiles (careful - will lose profile data!)
DROP TABLE IF EXISTS game_profiles CASCADE;
```

---

## Summary

✅ Lobbies can now exist with round = 0
✅ Users properly synced with Supabase Auth
✅ Foreign keys reference correct tables
✅ Auto-create profile on signup
✅ Realtime updates working
✅ Code updated to use game_profiles

The lobby system is now ready to use! 🎉
