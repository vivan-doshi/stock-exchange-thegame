-- Check if current_player_position column exists and has data
SELECT game_id, current_player_position, dealer_position, current_round, current_transaction 
FROM games 
LIMIT 5;
