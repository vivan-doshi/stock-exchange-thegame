-- ==============================================================================
-- FIX GAMEPLAY RLS (Row Level Security) POLICIES
-- Run this to fix "Permission Denied" errors when Buying, Selling, or Passing
-- ==============================================================================

-- 1. GAMES: Allow players to update the game state (share_supply, dealer_position, etc)
-- Policy: A user can update a game if they are a participant (in game_players)
DROP POLICY IF EXISTS "Allow players to update game state" ON games;
CREATE POLICY "Allow players to update game state"
ON games
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_players
    WHERE game_players.game_id = games.game_id
    AND game_players.user_id = auth.uid()
  )
);

-- 2. GAME_PLAYERS: Allow players to update their OWN data (cash_balance, stock_holdings)
DROP POLICY IF EXISTS "Allow users to update their own player state" ON game_players;
CREATE POLICY "Allow users to update their own player state"
ON game_players
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. TRANSACTIONS: Allow players to log transactions
DROP POLICY IF EXISTS "Allow players to insert transactions" ON transactions;
CREATE POLICY "Allow players to insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_players
    WHERE game_players.game_id = transactions.game_id
    AND game_players.user_id = auth.uid()
  )
);

-- 4. Enable Read Access for Transactions (so you can see recent activity)
DROP POLICY IF EXISTS "Allow players to view transactions" ON transactions;
CREATE POLICY "Allow players to view transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_players
    WHERE game_players.game_id = transactions.game_id
    AND game_players.user_id = auth.uid()
  )
);

-- 5. Verification: List active policies to confirm
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('games', 'game_players', 'transactions')
ORDER BY tablename, policyname;

-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste this content
-- 3. Click RUN
-- 4. In your Game Browser Tab, Refresh and try Buying/Selling again.
-- 
-- TRUBLESHOOTING:
-- If it still says "It is not your turn" but you are sure it is:
-- LOG OUT and LOG IN again. Your session ID might not match your Player ID.
-- ==============================================================================
