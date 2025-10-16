import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper function to ensure user profile exists
    const ensureProfile = async (user: User) => {
      try {
        // Check if profile exists
        const { data: profile, error: checkError } = await supabase
          .from('game_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        // Profile exists, we're good
        if (profile) {
          console.log('Profile exists for user:', user.id);
          return;
        }

        // Profile doesn't exist, try to create it
        if (checkError?.code === 'PGRST116') {
          console.log('Profile missing, creating...');

          const username =
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            `Player_${user.id.substring(0, 8)}`;

          const { error: insertError } = await supabase.from('game_profiles').insert({
            user_id: user.id,
            username: username,
            avatar_url: user.user_metadata?.avatar_url || ''
          });

          if (insertError) {
            // Check if it's a duplicate key error (profile was created by trigger)
            if (insertError.code === '23505') {
              console.log('Profile was created by database trigger (race condition)');
              return;
            }
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
          }
        }
      } catch (error) {
        console.error('Error ensuring profile:', error);
      }
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
