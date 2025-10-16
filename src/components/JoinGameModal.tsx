import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface JoinGameModalProps {
  onClose: () => void;
  onGameJoined: (gameId: string) => void;
  preselectedGameId?: string | null;
}

const JoinGameModal: React.FC<JoinGameModalProps> = ({ onClose, onGameJoined, preselectedGameId }) => {
  const { user } = useAuth();
  const [gameCode, setGameCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If a game was preselected from the lobby list, join it automatically
    if (preselectedGameId) {
      handleJoin(preselectedGameId);
    }
  }, [preselectedGameId]);

  const handleJoin = async (gameId?: string) => {
    if (!user) return;

    const targetGameId = gameId || gameCode.trim();

    if (!targetGameId) {
      setError('Please enter a game code');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      // Check if game exists and is waiting
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*, game_players(*)')
        .eq('game_id', targetGameId)
        .single();

      if (gameError || !gameData) {
        setError('Game not found');
        setJoining(false);
        return;
      }

      if (gameData.status !== 'waiting') {
        setError('This game has already started or ended');
        setJoining(false);
        return;
      }

      // Check if player is already in the game
      const existingPlayer = gameData.game_players?.find((p: any) => p.user_id === user.id);
      if (existingPlayer) {
        // Player is already in the game, just navigate to waiting room
        onGameJoined(targetGameId);
        return;
      }

      // Check if game is full
      const currentPlayerCount = gameData.game_players?.length || 0;
      if (currentPlayerCount >= gameData.max_players) {
        setError('This game is full');
        setJoining(false);
        return;
      }

      // Add player to game
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: targetGameId,
          user_id: user.id,
          player_position: currentPlayerCount + 1,
          is_ready: false,
          is_host: false
        });

      if (playerError) throw playerError;

      // Navigate to the waiting room
      onGameJoined(targetGameId);
    } catch (err: any) {
      console.error('Error joining game:', err);
      setError(err.message || 'Failed to join game');
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Join Game</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        {!preselectedGameId && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Game Code
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter game code (UUID)"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={joining}
              />
              <p className="text-xs text-slate-400 mt-2">
                Ask the host for the game code to join a private game
              </p>
            </div>
          </div>
        )}

        {preselectedGameId && joining && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Action Buttons */}
        {!preselectedGameId && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
              disabled={joining}
            >
              Cancel
            </button>
            <button
              onClick={() => handleJoin()}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={joining || !gameCode.trim()}
            >
              {joining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGameModal;
