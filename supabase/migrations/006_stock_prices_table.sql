-- Stock Price History Table
-- Tracks historical stock prices at the end of each round for analytics and charts

CREATE TABLE stock_price_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number >= 1),

    -- Individual Stock Prices (in rupees)
    atlas_bank INTEGER CHECK (atlas_bank >= 0),
    titan_steel INTEGER CHECK (titan_steel >= 0),
    global_industries INTEGER CHECK (global_industries >= 0),
    omega_energy INTEGER CHECK (omega_energy >= 0),
    vitalcare_pharma INTEGER CHECK (vitalcare_pharma >= 0),
    novatech INTEGER CHECK (novatech >= 0),

    -- Timestamp
    recorded_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    UNIQUE (game_id, round_number)
);

-- Indexes for performance
CREATE INDEX idx_stock_history_game ON stock_price_history(game_id);
CREATE INDEX idx_stock_history_round ON stock_price_history(round_number);
CREATE INDEX idx_stock_history_recorded ON stock_price_history(recorded_at);

-- Composite indexes
CREATE INDEX idx_stock_history_game_round ON stock_price_history(game_id, round_number);
CREATE INDEX idx_stock_history_timeline ON stock_price_history(game_id, recorded_at);

-- Comments
COMMENT ON TABLE stock_price_history IS 'Historical stock prices recorded at the end of each round';
COMMENT ON COLUMN stock_price_history.round_number IS 'Round when prices were recorded (1-10)';
COMMENT ON COLUMN stock_price_history.atlas_bank IS 'Atlas Bank stock price at end of round';
COMMENT ON COLUMN stock_price_history.titan_steel IS 'Titan Steel stock price at end of round';
COMMENT ON COLUMN stock_price_history.global_industries IS 'Global Industries stock price at end of round';
COMMENT ON COLUMN stock_price_history.omega_energy IS 'Omega Energy stock price at end of round';
COMMENT ON COLUMN stock_price_history.vitalcare_pharma IS 'VitalCare Pharma stock price at end of round';
COMMENT ON COLUMN stock_price_history.novatech IS 'NovaTech stock price at end of round';

-- Function to record stock prices at end of round
CREATE OR REPLACE FUNCTION record_stock_prices(
    p_game_id UUID,
    p_round_number INTEGER
) RETURNS UUID AS $$
DECLARE
    v_history_id UUID;
    v_stock_prices JSONB;
BEGIN
    -- Get current stock prices from game
    SELECT stock_prices INTO v_stock_prices
    FROM games
    WHERE game_id = p_game_id;

    -- Insert price history
    INSERT INTO stock_price_history (
        game_id,
        round_number,
        atlas_bank,
        titan_steel,
        global_industries,
        omega_energy,
        vitalcare_pharma,
        novatech
    ) VALUES (
        p_game_id,
        p_round_number,
        (v_stock_prices->>'atlas_bank')::INTEGER,
        (v_stock_prices->>'titan_steel')::INTEGER,
        (v_stock_prices->>'global_industries')::INTEGER,
        (v_stock_prices->>'omega_energy')::INTEGER,
        (v_stock_prices->>'vitalcare_pharma')::INTEGER,
        (v_stock_prices->>'novatech')::INTEGER
    )
    ON CONFLICT (game_id, round_number)
    DO UPDATE SET
        atlas_bank = EXCLUDED.atlas_bank,
        titan_steel = EXCLUDED.titan_steel,
        global_industries = EXCLUDED.global_industries,
        omega_energy = EXCLUDED.omega_energy,
        vitalcare_pharma = EXCLUDED.vitalcare_pharma,
        novatech = EXCLUDED.novatech,
        recorded_at = NOW()
    RETURNING history_id INTO v_history_id;

    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_stock_prices IS 'Records current stock prices for a specific round';

-- Normalized view for easier querying (one row per stock per round)
CREATE OR REPLACE VIEW stock_price_history_normalized AS
SELECT
    game_id,
    round_number,
    recorded_at,
    'atlas_bank' as stock_symbol,
    atlas_bank as price
FROM stock_price_history
UNION ALL
SELECT
    game_id,
    round_number,
    recorded_at,
    'titan_steel' as stock_symbol,
    titan_steel as price
FROM stock_price_history
UNION ALL
SELECT
    game_id,
    round_number,
    recorded_at,
    'global_industries' as stock_symbol,
    global_industries as price
FROM stock_price_history
UNION ALL
SELECT
    game_id,
    round_number,
    recorded_at,
    'omega_energy' as stock_symbol,
    omega_energy as price
FROM stock_price_history
UNION ALL
SELECT
    game_id,
    round_number,
    recorded_at,
    'vitalcare_pharma' as stock_symbol,
    vitalcare_pharma as price
FROM stock_price_history
UNION ALL
SELECT
    game_id,
    round_number,
    recorded_at,
    'novatech' as stock_symbol,
    novatech as price
FROM stock_price_history;

COMMENT ON VIEW stock_price_history_normalized IS 'Stock prices in normalized format (one row per stock per round) for easier querying';

-- View for price changes between rounds
CREATE OR REPLACE VIEW stock_price_changes AS
SELECT
    curr.game_id,
    curr.round_number,
    curr.recorded_at,
    'atlas_bank' as stock_symbol,
    curr.atlas_bank as current_price,
    prev.atlas_bank as previous_price,
    curr.atlas_bank - prev.atlas_bank as price_change,
    ROUND(((curr.atlas_bank - prev.atlas_bank)::DECIMAL / prev.atlas_bank::DECIMAL) * 100, 2) as percent_change
FROM stock_price_history curr
LEFT JOIN stock_price_history prev
    ON curr.game_id = prev.game_id
    AND prev.round_number = curr.round_number - 1
UNION ALL
SELECT
    curr.game_id,
    curr.round_number,
    curr.recorded_at,
    'titan_steel' as stock_symbol,
    curr.titan_steel as current_price,
    prev.titan_steel as previous_price,
    curr.titan_steel - prev.titan_steel as price_change,
    ROUND(((curr.titan_steel - prev.titan_steel)::DECIMAL / prev.titan_steel::DECIMAL) * 100, 2) as percent_change
FROM stock_price_history curr
LEFT JOIN stock_price_history prev
    ON curr.game_id = prev.game_id
    AND prev.round_number = curr.round_number - 1
UNION ALL
SELECT
    curr.game_id,
    curr.round_number,
    curr.recorded_at,
    'global_industries' as stock_symbol,
    curr.global_industries as current_price,
    prev.global_industries as previous_price,
    curr.global_industries - prev.global_industries as price_change,
    ROUND(((curr.global_industries - prev.global_industries)::DECIMAL / prev.global_industries::DECIMAL) * 100, 2) as percent_change
FROM stock_price_history curr
LEFT JOIN stock_price_history prev
    ON curr.game_id = prev.game_id
    AND prev.round_number = curr.round_number - 1
UNION ALL
SELECT
    curr.game_id,
    curr.round_number,
    curr.recorded_at,
    'omega_energy' as stock_symbol,
    curr.omega_energy as current_price,
    prev.omega_energy as previous_price,
    curr.omega_energy - prev.omega_energy as price_change,
    ROUND(((curr.omega_energy - prev.omega_energy)::DECIMAL / prev.omega_energy::DECIMAL) * 100, 2) as percent_change
FROM stock_price_history curr
LEFT JOIN stock_price_history prev
    ON curr.game_id = prev.game_id
    AND prev.round_number = curr.round_number - 1
UNION ALL
SELECT
    curr.game_id,
    curr.round_number,
    curr.recorded_at,
    'vitalcare_pharma' as stock_symbol,
    curr.vitalcare_pharma as current_price,
    prev.vitalcare_pharma as previous_price,
    curr.vitalcare_pharma - prev.vitalcare_pharma as price_change,
    ROUND(((curr.vitalcare_pharma - prev.vitalcare_pharma)::DECIMAL / prev.vitalcare_pharma::DECIMAL) * 100, 2) as percent_change
FROM stock_price_history curr
LEFT JOIN stock_price_history prev
    ON curr.game_id = prev.game_id
    AND prev.round_number = curr.round_number - 1
UNION ALL
SELECT
    curr.game_id,
    curr.round_number,
    curr.recorded_at,
    'novatech' as stock_symbol,
    curr.novatech as current_price,
    prev.novatech as previous_price,
    curr.novatech - prev.novatech as price_change,
    ROUND(((curr.novatech - prev.novatech)::DECIMAL / prev.novatech::DECIMAL) * 100, 2) as percent_change
FROM stock_price_history curr
LEFT JOIN stock_price_history prev
    ON curr.game_id = prev.game_id
    AND prev.round_number = curr.round_number - 1;

COMMENT ON VIEW stock_price_changes IS 'Price changes and percent changes between consecutive rounds';

-- View for stock volatility analysis
CREATE OR REPLACE VIEW stock_volatility AS
SELECT
    game_id,
    'atlas_bank' as stock_symbol,
    AVG(atlas_bank) as avg_price,
    MIN(atlas_bank) as min_price,
    MAX(atlas_bank) as max_price,
    STDDEV(atlas_bank) as price_stddev,
    MAX(atlas_bank) - MIN(atlas_bank) as price_range
FROM stock_price_history
GROUP BY game_id
UNION ALL
SELECT
    game_id,
    'titan_steel' as stock_symbol,
    AVG(titan_steel) as avg_price,
    MIN(titan_steel) as min_price,
    MAX(titan_steel) as max_price,
    STDDEV(titan_steel) as price_stddev,
    MAX(titan_steel) - MIN(titan_steel) as price_range
FROM stock_price_history
GROUP BY game_id
UNION ALL
SELECT
    game_id,
    'global_industries' as stock_symbol,
    AVG(global_industries) as avg_price,
    MIN(global_industries) as min_price,
    MAX(global_industries) as max_price,
    STDDEV(global_industries) as price_stddev,
    MAX(global_industries) - MIN(global_industries) as price_range
FROM stock_price_history
GROUP BY game_id
UNION ALL
SELECT
    game_id,
    'omega_energy' as stock_symbol,
    AVG(omega_energy) as avg_price,
    MIN(omega_energy) as min_price,
    MAX(omega_energy) as max_price,
    STDDEV(omega_energy) as price_stddev,
    MAX(omega_energy) - MIN(omega_energy) as price_range
FROM stock_price_history
GROUP BY game_id
UNION ALL
SELECT
    game_id,
    'vitalcare_pharma' as stock_symbol,
    AVG(vitalcare_pharma) as avg_price,
    MIN(vitalcare_pharma) as min_price,
    MAX(vitalcare_pharma) as max_price,
    STDDEV(vitalcare_pharma) as price_stddev,
    MAX(vitalcare_pharma) - MIN(vitalcare_pharma) as price_range
FROM stock_price_history
GROUP BY game_id
UNION ALL
SELECT
    game_id,
    'novatech' as stock_symbol,
    AVG(novatech) as avg_price,
    MIN(novatech) as min_price,
    MAX(novatech) as max_price,
    STDDEV(novatech) as price_stddev,
    MAX(novatech) - MIN(novatech) as price_range
FROM stock_price_history
GROUP BY game_id;

COMMENT ON VIEW stock_volatility IS 'Volatility statistics for each stock per game';
