-- ============================================
-- Enable Realtime for transactions table
-- ============================================

-- Enable realtime on transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- DONE! Realtime enabled for transactions
-- ============================================
