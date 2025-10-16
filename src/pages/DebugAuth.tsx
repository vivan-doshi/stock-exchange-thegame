import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DebugAuth: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;

    addLog('Checking profile for user: ' + user.id);

    try {
      const { data, error } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        addLog('Profile check error: ' + error.message);
        setProfileError(error.message);
        setProfile(null);
      } else {
        addLog('Profile found: ' + JSON.stringify(data));
        setProfile(data);
        setProfileError(null);
      }
    } catch (err: any) {
      addLog('Profile check exception: ' + err.message);
      setProfileError(err.message);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    setCreating(true);
    addLog('Attempting to create profile...');

    try {
      const username =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        `Player_${user.id.substring(0, 8)}`;

      addLog('Username will be: ' + username);

      const { data, error } = await supabase
        .from('game_profiles')
        .insert({
          user_id: user.id,
          username: username,
          avatar_url: user.user_metadata?.avatar_url || ''
        })
        .select()
        .single();

      if (error) {
        addLog('Create profile error: ' + error.message);
        addLog('Error details: ' + JSON.stringify(error));
        addLog('Error code: ' + error.code);
        addLog('Error hint: ' + error.hint);

        // Specific error messages
        if (error.message.includes('policy')) {
          addLog('⚠️ RLS POLICY ERROR - Run FIX_RLS_NOW.sql in Supabase!');
        }
        if (error.message.includes('duplicate')) {
          addLog('⚠️ USERNAME CONFLICT - Try a different username');
        }
        if (error.message.includes('foreign key')) {
          addLog('⚠️ USER ID MISMATCH - Auth user not found');
        }

        setProfileError(error.message);
      } else {
        addLog('Profile created successfully: ' + JSON.stringify(data));
        setProfile(data);
        setProfileError(null);
      }
    } catch (err: any) {
      addLog('Create profile exception: ' + err.message);
      addLog('Exception stack: ' + err.stack);
      setProfileError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const testDatabaseConnection = async () => {
    addLog('Testing database connection...');

    try {
      const { error } = await supabase
        .from('game_profiles')
        .select('count')
        .limit(1);

      if (error) {
        addLog('Database test error: ' + error.message);
      } else {
        addLog('Database connection OK');
      }
    } catch (err: any) {
      addLog('Database test exception: ' + err.message);
    }
  };

  const testRLSPolicies = async () => {
    if (!user) {
      addLog('⚠️ Not signed in - cannot test RLS');
      return;
    }

    addLog('Testing RLS policies...');
    addLog('Current user ID: ' + user.id);

    // Test SELECT
    try {
      const { data: selectData, error: selectError } = await supabase
        .from('game_profiles')
        .select('*')
        .limit(1);

      if (selectError) {
        addLog('❌ SELECT failed: ' + selectError.message);
      } else {
        addLog('✅ SELECT works (found ' + (selectData?.length || 0) + ' profiles)');
      }
    } catch (err: any) {
      addLog('❌ SELECT exception: ' + err.message);
    }

    // Test INSERT
    const testUsername = 'test_' + Date.now();
    try {
      const { error: insertError } = await supabase
        .from('game_profiles')
        .insert({
          user_id: user.id,
          username: testUsername
        });

      if (insertError) {
        addLog('❌ INSERT failed: ' + insertError.message);
        if (insertError.message.includes('policy')) {
          addLog('🔒 RLS POLICY BLOCKING INSERT!');
          addLog('👉 Run COMPLETE_FIX_NOW.sql to fix this');
        }
        if (insertError.message.includes('duplicate')) {
          addLog('ℹ️ Profile already exists (this is OK)');
        }
      } else {
        addLog('✅ INSERT works');
        // Clean up test profile
        await supabase
          .from('game_profiles')
          .delete()
          .eq('username', testUsername);
        addLog('🧹 Cleaned up test profile');
      }
    } catch (err: any) {
      addLog('❌ INSERT exception: ' + err.message);
    }
  };

  const checkDatabaseTrigger = async () => {
    addLog('Checking if database trigger exists...');

    try {
      const { data, error } = await supabase.rpc('check_trigger_exists', {
        trigger_name: 'on_auth_user_created'
      });

      if (error) {
        addLog('⚠️ Cannot check trigger (requires custom function in Supabase)');
        addLog('ℹ️ If sign-in with new accounts fails, run COMPLETE_FIX_NOW.sql');
      } else if (data) {
        addLog('✅ Auto-profile trigger exists');
      } else {
        addLog('❌ Auto-profile trigger missing!');
        addLog('👉 Run COMPLETE_FIX_NOW.sql to add the trigger');
      }
    } catch (err: any) {
      addLog('ℹ️ Cannot verify trigger - but it might exist');
      addLog('ℹ️ If you cannot sign in with new accounts, run COMPLETE_FIX_NOW.sql');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth & Profile Debug Page</h1>

        {/* User Info */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Full Name:</strong> {user.user_metadata?.full_name || 'N/A'}</p>
              <p><strong>Avatar URL:</strong> {user.user_metadata?.avatar_url || 'N/A'}</p>
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-400">View Full User Object</summary>
                <pre className="mt-2 bg-slate-900 p-4 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-slate-400">Not signed in</p>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Info</h2>
          {profile ? (
            <div className="space-y-2">
              <p className="text-green-400">✓ Profile exists</p>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-400">View Full Profile</summary>
                <pre className="mt-2 bg-slate-900 p-4 rounded overflow-auto">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div>
              <p className="text-yellow-400 mb-4">⚠ No profile found</p>
              {profileError && (
                <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4">
                  <p className="text-red-400">{profileError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkProfile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              disabled={!user}
            >
              Refresh Profile
            </button>
            <button
              onClick={createProfile}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              disabled={!user || creating || !!profile}
            >
              {creating ? 'Creating...' : 'Create Profile'}
            </button>
            <button
              onClick={testDatabaseConnection}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Test Database
            </button>
            <button
              onClick={testRLSPolicies}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
              disabled={!user}
            >
              Test RLS Policies
            </button>
            <button
              onClick={checkDatabaseTrigger}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
            >
              Check Trigger
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-slate-900 rounded p-4 max-h-96 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-slate-500">No logs yet</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, idx) => (
                  <div key={idx} className="text-slate-300">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're signed in (check User Info section)</li>
            <li>Click "Test Database" to verify connection</li>
            <li>Click "Refresh Profile" to check if profile exists</li>
            <li>If no profile, click "Create Profile"</li>
            <li>Check browser console (F12) for additional errors</li>
            <li>Check Supabase Dashboard → Logs for database errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
