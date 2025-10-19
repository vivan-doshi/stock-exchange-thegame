-- Check current game state
SELECT 
  game_id,
  current_round,
  current_transaction,
  dealer_position,
  current_player_position,
  status
FROM games 
WHERE status = 'in_progress'
ORDER BY started_at DESC
LIMIT 3;
