-- ============================================
-- Fix transaction amount constraint
-- ============================================

-- Drop the old constraint that's too strict
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS amount_matches_calculation;

-- Add a new, more flexible constraint
-- For buy/sell transactions, check absolute value matches
-- For other transactions (pass, card effects), allow any amount
ALTER TABLE transactions ADD CONSTRAINT amount_matches_calculation CHECK (
    -- For transactions with quantity and price, check absolute value matches
    (quantity IS NOT NULL AND price_per_share IS NOT NULL AND ABS(total_amount) = quantity * price_per_share)
    OR
    -- For transactions without quantity/price (pass, card effects), allow any amount
    (quantity IS NULL OR price_per_share IS NULL)
);

-- ============================================
-- DONE! Transaction constraint fixed
-- ============================================
