-- Achievements System
-- Defines available achievements and tracks user unlocks

-- Achievements Table
CREATE TABLE achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,

    -- Achievement Criteria
    mode VARCHAR(20) CHECK (mode IN ('trader', 'investor', 'strategist', 'any')),
    variant VARCHAR(20) CHECK (variant IN ('standard', 'extended', 'any')),

    -- Display
    icon_url VARCHAR(255),
    rarity VARCHAR(20) NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),

    -- Sort Order
    display_order INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE, -- Hidden until unlocked

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_mode_variant CHECK (
        (mode IS NULL OR mode IN ('trader', 'investor', 'strategist', 'any')) AND
        (variant IS NULL OR variant IN ('standard', 'extended', 'any'))
    )
);

-- User Achievements Table (unlocked achievements)
CREATE TABLE user_achievements (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(achievement_id) ON DELETE CASCADE,

    -- Unlock Details
    unlocked_at TIMESTAMP DEFAULT NOW(),
    game_id UUID REFERENCES games(game_id) ON DELETE SET NULL, -- Which game earned it (if applicable)

    -- Progress tracking (for multi-step achievements)
    progress_data JSONB DEFAULT '{}'::jsonb,

    PRIMARY KEY (user_id, achievement_id)
);

-- Indexes for achievements
CREATE INDEX idx_achievements_mode ON achievements(mode);
CREATE INDEX idx_achievements_variant ON achievements(variant);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_display_order ON achievements(display_order);
CREATE INDEX idx_achievements_hidden ON achievements(is_hidden);

-- Indexes for user_achievements
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at);
CREATE INDEX idx_user_achievements_game ON user_achievements(game_id);
CREATE INDEX idx_user_achievements_progress ON user_achievements USING GIN (progress_data);

-- Comments
COMMENT ON TABLE achievements IS 'Available achievements that players can unlock';
COMMENT ON TABLE user_achievements IS 'Achievements unlocked by users';
COMMENT ON COLUMN achievements.mode IS 'Which game mode: trader, investor, strategist, or any';
COMMENT ON COLUMN achievements.variant IS 'Which variant: standard, extended, or any';
COMMENT ON COLUMN achievements.rarity IS 'Common (easy), Rare (moderate), Epic (hard), Legendary (very hard)';
COMMENT ON COLUMN achievements.is_hidden IS 'Hidden from UI until unlocked (for secret achievements)';
COMMENT ON COLUMN user_achievements.progress_data IS 'Tracks progress for multi-step achievements';

-- View for user achievement progress
CREATE OR REPLACE VIEW user_achievement_progress AS
SELECT
    u.user_id,
    u.username,
    a.achievement_id,
    a.name,
    a.description,
    a.mode,
    a.variant,
    a.rarity,
    a.icon_url,
    CASE WHEN ua.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_unlocked,
    ua.unlocked_at,
    ua.game_id as unlocked_in_game,
    ua.progress_data
FROM users u
CROSS JOIN achievements a
LEFT JOIN user_achievements ua
    ON u.user_id = ua.user_id
    AND a.achievement_id = ua.achievement_id
WHERE a.is_hidden = FALSE OR ua.user_id IS NOT NULL
ORDER BY u.user_id, a.display_order, a.rarity, a.name;

COMMENT ON VIEW user_achievement_progress IS 'Shows all achievements and their unlock status per user';

-- Function to unlock achievement for user
CREATE OR REPLACE FUNCTION unlock_achievement(
    p_user_id UUID,
    p_achievement_name VARCHAR(100),
    p_game_id UUID DEFAULT NULL,
    p_progress_data JSONB DEFAULT '{}'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
    v_achievement_id UUID;
    v_already_unlocked BOOLEAN;
BEGIN
    -- Get achievement ID
    SELECT achievement_id INTO v_achievement_id
    FROM achievements
    WHERE name = p_achievement_name;

    IF v_achievement_id IS NULL THEN
        RAISE EXCEPTION 'Achievement "%" does not exist', p_achievement_name;
    END IF;

    -- Check if already unlocked
    SELECT EXISTS(
        SELECT 1 FROM user_achievements
        WHERE user_id = p_user_id AND achievement_id = v_achievement_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN FALSE; -- Already unlocked
    END IF;

    -- Unlock achievement
    INSERT INTO user_achievements (user_id, achievement_id, game_id, progress_data)
    VALUES (p_user_id, v_achievement_id, p_game_id, p_progress_data);

    RETURN TRUE; -- Successfully unlocked
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION unlock_achievement IS 'Unlocks an achievement for a user if not already unlocked';

-- Function to check achievement eligibility
CREATE OR REPLACE FUNCTION check_achievement_eligibility(
    p_user_id UUID,
    p_achievement_name VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    v_achievement_id UUID;
    v_unlocked BOOLEAN;
BEGIN
    -- Get achievement ID
    SELECT achievement_id INTO v_achievement_id
    FROM achievements
    WHERE name = p_achievement_name;

    IF v_achievement_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if unlocked
    SELECT EXISTS(
        SELECT 1 FROM user_achievements
        WHERE user_id = p_user_id AND achievement_id = v_achievement_id
    ) INTO v_unlocked;

    RETURN NOT v_unlocked; -- Eligible if not yet unlocked
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_achievement_eligibility IS 'Checks if user is eligible to unlock achievement (not already unlocked)';

-- Insert default achievements
INSERT INTO achievements (name, description, mode, variant, rarity, display_order, is_hidden) VALUES
-- Common Achievements
('First Steps', 'Complete your first game in any mode', 'any', 'any', 'common', 1, FALSE),
('Trader Novice', 'Complete 5 games in Trader mode', 'trader', 'any', 'common', 2, FALSE),
('Investor Novice', 'Complete 5 games in Investor mode', 'investor', 'any', 'common', 3, FALSE),
('Strategist Novice', 'Complete 5 games in Strategist mode', 'strategist', 'any', 'common', 4, FALSE),
('Small Victory', 'Win your first game', 'any', 'any', 'common', 5, FALSE),
('Millionaire', 'End a game with net worth over ₹1,000,000', 'any', 'any', 'common', 6, FALSE),

-- Rare Achievements
('Stock Baron', 'Become Chairman of 3 different stocks in one game', 'any', 'any', 'rare', 10, FALSE),
('Trading Master', 'Win 10 games in Trader mode', 'trader', 'any', 'rare', 11, FALSE),
('Short Seller', 'Profit ₹200,000+ from short selling in one game', 'investor', 'any', 'rare', 12, FALSE),
('Option Wizard', 'Exercise 5 profitable options in one game', 'strategist', 'any', 'rare', 13, FALSE),
('Extended Champion', 'Win a game in Extended variant (7-12 players)', 'any', 'extended', 'rare', 14, FALSE),
('Multimillionaire', 'End a game with net worth over ₹2,000,000', 'any', 'any', 'rare', 15, FALSE),

-- Epic Achievements
('Market Dominator', 'Become Chairman of all 6 stocks simultaneously', 'any', 'any', 'epic', 20, FALSE),
('Perfect Game', 'Win without ever selling a stock', 'trader', 'any', 'epic', 21, FALSE),
('Bear King', 'Win an Investor mode game with 50%+ profit from shorts', 'investor', 'any', 'epic', 22, FALSE),
('Dividend Dynasty', 'Issue 10+ dividends as Chairman in one game', 'strategist', 'any', 'epic', 23, FALSE),
('Marathon Winner', 'Win 5 Extended variant games', 'any', 'extended', 'epic', 24, FALSE),
('Grand Tycoon', 'End a game with net worth over ₹3,000,000', 'any', 'any', 'epic', 25, FALSE),

-- Legendary Achievements
('Market Titan', 'Win 50 games across all modes', 'any', 'any', 'legendary', 30, FALSE),
('Perfect Strategist', 'Win with 100% profitable options and 5+ dividends', 'strategist', 'any', 'legendary', 31, FALSE),
('Bankruptcy Survivor', 'Come back from <₹100,000 cash to win the game', 'any', 'any', 'legendary', 32, FALSE),
('Ultimate Champion', 'Win 10 Extended variant games', 'any', 'extended', 'legendary', 33, FALSE),
('Billionaire Club', 'End a game with net worth over ₹4,000,000', 'any', 'any', 'legendary', 34, FALSE),

-- Hidden Achievements
('Against All Odds', 'Win from last place after round 8', 'any', 'any', 'epic', 40, TRUE),
('Speed Trader', 'Complete all 3 transactions in under 30 seconds', 'any', 'any', 'rare', 41, TRUE),
('Lucky Seven', 'Win exactly 7 games in a row', 'any', 'any', 'legendary', 42, TRUE),
('NovaTech Fanatic', 'End game holding 80%+ of NovaTech shares', 'any', 'any', 'rare', 43, TRUE),
('Market Crash', 'Cause a stock to drop ₹50+ in one round', 'any', 'any', 'rare', 44, TRUE);

-- View for achievement statistics
CREATE OR REPLACE VIEW achievement_statistics AS
SELECT
    a.achievement_id,
    a.name,
    a.rarity,
    a.mode,
    a.variant,
    COUNT(ua.user_id) as unlock_count,
    COUNT(ua.user_id)::DECIMAL / NULLIF((SELECT COUNT(*) FROM users), 0) * 100 as unlock_percentage,
    MIN(ua.unlocked_at) as first_unlocked_at,
    MAX(ua.unlocked_at) as last_unlocked_at
FROM achievements a
LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id
GROUP BY a.achievement_id, a.name, a.rarity, a.mode, a.variant
ORDER BY unlock_percentage DESC, a.rarity, a.display_order;

COMMENT ON VIEW achievement_statistics IS 'Statistics showing how many users have unlocked each achievement';

-- View for user achievement summary
CREATE OR REPLACE VIEW user_achievement_summary AS
SELECT
    u.user_id,
    u.username,
    COUNT(ua.achievement_id) as total_unlocked,
    COUNT(CASE WHEN a.rarity = 'common' THEN 1 END) as common_unlocked,
    COUNT(CASE WHEN a.rarity = 'rare' THEN 1 END) as rare_unlocked,
    COUNT(CASE WHEN a.rarity = 'epic' THEN 1 END) as epic_unlocked,
    COUNT(CASE WHEN a.rarity = 'legendary' THEN 1 END) as legendary_unlocked,
    (SELECT COUNT(*) FROM achievements WHERE is_hidden = FALSE) as total_available,
    ROUND(COUNT(ua.achievement_id)::DECIMAL / NULLIF((SELECT COUNT(*) FROM achievements WHERE is_hidden = FALSE), 0) * 100, 2) as completion_percentage,
    MAX(ua.unlocked_at) as last_achievement_at
FROM users u
LEFT JOIN user_achievements ua ON u.user_id = ua.user_id
LEFT JOIN achievements a ON ua.achievement_id = a.achievement_id
GROUP BY u.user_id, u.username;

COMMENT ON VIEW user_achievement_summary IS 'Summary of achievement progress per user';

-- View for recent unlocks (leaderboard style)
CREATE OR REPLACE VIEW recent_achievement_unlocks AS
SELECT
    u.username,
    a.name as achievement_name,
    a.description,
    a.rarity,
    ua.unlocked_at,
    g.game_id,
    g.game_mode,
    g.game_variant
FROM user_achievements ua
JOIN users u ON ua.user_id = u.user_id
JOIN achievements a ON ua.achievement_id = a.achievement_id
LEFT JOIN games g ON ua.game_id = g.game_id
ORDER BY ua.unlocked_at DESC
LIMIT 100;

COMMENT ON VIEW recent_achievement_unlocks IS 'Most recent 100 achievement unlocks across all users';
