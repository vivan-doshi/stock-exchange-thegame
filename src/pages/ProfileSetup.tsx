import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ProfileSetup: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load existing profile if it exists
    const loadProfile = async () => {
      const { data } = await supabase
        .from('game_profiles')
        .select('username, display_name')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUsername(data.username || '');
        setDisplayName(data.display_name || '');
      }
    };

    loadProfile();
  }, [user, navigate]);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const checkUsername = setTimeout(async () => {
      setCheckingUsername(true);
      const { data } = await supabase
        .from('game_profiles')
        .select('username')
        .eq('username', username)
        .neq('user_id', user?.id || '')
        .single();

      setUsernameAvailable(!data);
      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(checkUsername);
  }, [username, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Validate username
      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        setLoading(false);
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError('Username can only contain letters, numbers, and underscores');
        setLoading(false);
        return;
      }

      // If display name is empty, use username
      const finalDisplayName = displayName.trim() || username;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('game_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('game_profiles')
          .update({
            username: username,
            display_name: finalDisplayName,
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('game_profiles')
          .insert({
            user_id: user.id,
            username: username,
            display_name: finalDisplayName,
            avatar_url: user.user_metadata?.avatar_url || '',
          });

        if (insertError) throw insertError;
      }

      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      if (err.code === '23505') {
        setError('Username is already taken. Please choose another one.');
      } else {
        setError(err.message || 'Failed to save profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Stock Market Tycoon!</h1>
          <p className="text-slate-400">Let's set up your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
            {checkingUsername && (
              <p className="text-sm text-slate-400 mt-1">Checking availability...</p>
            )}
            {usernameAvailable === true && username.length >= 3 && (
              <p className="text-sm text-green-400 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Username available
              </p>
            )}
            {usernameAvailable === false && (
              <p className="text-sm text-red-400 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Username taken
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Used for login and mentions. 3-20 characters, letters, numbers, and underscores only.
            </p>
          </div>

          {/* Display Name Field */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
              Display Name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your full name or nickname"
              maxLength={50}
            />
            <p className="text-xs text-slate-400 mt-1">
              Shown to other players. If empty, your username will be used.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading || usernameAvailable === false || !username}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* Preview */}
        {(username || displayName) && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Preview:</p>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-white font-medium">
                {displayName.trim() || username || 'Your Display Name'}
              </p>
              <p className="text-slate-400 text-sm">@{username || 'username'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
