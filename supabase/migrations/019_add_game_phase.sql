-- Add 'phase' column to 'games' table
-- Tracks whether the game is in active trading ('trading') or end-of-round processing ('end_of_round')

ALTER TABLE games 
ADD COLUMN phase VARCHAR(20) NOT NULL DEFAULT 'trading' 
CHECK (phase IN ('trading', 'end_of_round'));

COMMENT ON COLUMN games.phase IS 'Current phase of the round: "trading" (active transactions) or "end_of_round" (price calculation)';

-- Add index for performance
CREATE INDEX idx_games_phase ON games(phase);
