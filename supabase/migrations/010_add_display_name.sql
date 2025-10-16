-- ============================================
-- Add display_name field to game_profiles
-- ============================================

-- Add display_name column (optional, defaults to username if not set)
ALTER TABLE game_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profiles to use username as display_name
UPDATE game_profiles SET display_name = username WHERE display_name IS NULL;

-- Add index for display_name searches
CREATE INDEX IF NOT EXISTS idx_game_profiles_display_name ON game_profiles(display_name);

-- Update the trigger to set display_name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username TEXT;
    v_display_name TEXT;
    v_counter INTEGER := 0;
    v_base_username TEXT;
    v_profile_exists BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS (
        SELECT 1 FROM public.game_profiles WHERE user_id = NEW.id
    ) INTO v_profile_exists;

    -- If profile already exists, skip creation
    IF v_profile_exists THEN
        RAISE NOTICE 'Profile already exists for user %', NEW.id;
        RETURN NEW;
    END IF;

    -- Generate display name from full_name (if available)
    v_display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

    -- Generate base username from email
    v_base_username := COALESCE(
        SPLIT_PART(NEW.email, '@', 1),
        'Player_' || SUBSTRING(NEW.id::TEXT, 1, 8)
    );

    v_username := v_base_username;

    -- Handle duplicate usernames
    WHILE EXISTS (SELECT 1 FROM public.game_profiles WHERE username = v_username) LOOP
        v_counter := v_counter + 1;
        v_username := v_base_username || v_counter;
    END LOOP;

    -- If no display name, use username
    IF v_display_name = '' THEN
        v_display_name := v_username;
    END IF;

    -- Insert profile
    INSERT INTO public.game_profiles (user_id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        v_username,
        v_display_name,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    RAISE NOTICE 'Created profile for user % with username % and display_name %', NEW.id, v_username, v_display_name;
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile was created by another process, that's OK
        RAISE NOTICE 'Profile already exists (race condition) for user %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE! display_name field added
-- ============================================
