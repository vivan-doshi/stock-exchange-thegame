import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { GameMode, GameVariant } from '../types';

interface CreateGameModalProps {
  onClose: () => void;
  onGameCreated: (gameId: string) => void;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose, onGameCreated }) => {
  const { user } = useAuth();
  const [gameMode, setGameMode] = useState<GameMode>('trader');
  const [gameVariant, setGameVariant] = useState<GameVariant>('standard');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [addAiPlayers, setAddAiPlayers] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user) return;

    setCreating(true);
    setError(null);

    try {
      // Determine player count range based on variant
      const minPlayers = 2;
      const variantMaxPlayers = gameVariant === 'standard' ? 6 : 12;

      if (maxPlayers < minPlayers || maxPlayers > variantMaxPlayers) {
        setError(`Player count must be between ${minPlayers} and ${variantMaxPlayers} for ${gameVariant} variant`);
        setCreating(false);
        return;
      }

      // Create the game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          game_mode: gameMode,
          game_variant: gameVariant,
          player_count: maxPlayers,
          max_players: maxPlayers,
          is_public: isPublic,
          host_user_id: user.id,
          status: 'waiting',
          current_round: 0,
          current_transaction: 0
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Add the host as the first player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: gameData.game_id,
          user_id: user.id,
          player_position: 1,
          is_ready: false,
          is_host: true
        });

      if (playerError) throw playerError;

      // TODO: Add AI players if requested
      if (addAiPlayers) {
        // This will be implemented when we add AI logic
        console.log('AI players will be added in future implementation');
      }

      // Navigate to the waiting room
      onGameCreated(gameData.game_id);
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || 'Failed to create game');
      setCreating(false);
    }
  };

  const getMaxPlayersForVariant = () => {
    return gameVariant === 'standard' ? 6 : 12;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Game</h2>
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
        <div className="space-y-5">
          {/* Game Mode Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setGameMode('trader')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  gameMode === 'trader'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Trader
              </button>
              <button
                onClick={() => setGameMode('investor')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  gameMode === 'investor'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Investor
              </button>
              <button
                onClick={() => setGameMode('strategist')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  gameMode === 'strategist'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Strategist
              </button>
            </div>
          </div>

          {/* Game Variant Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Game Variant
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setGameVariant('standard');
                  if (maxPlayers > 6) setMaxPlayers(6);
                }}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  gameVariant === 'standard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Standard (2-6)
              </button>
              <button
                onClick={() => setGameVariant('extended')}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  gameVariant === 'extended'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Extended (7-12)
              </button>
            </div>
          </div>

          {/* Number of Players */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Maximum Players: {maxPlayers}
            </label>
            <input
              type="range"
              min={2}
              max={getMaxPlayersForVariant()}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>2</span>
              <span>{getMaxPlayersForVariant()}</span>
            </div>
          </div>

          {/* Add AI Players Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div>
              <label className="text-sm font-semibold text-slate-300">Add AI Players</label>
              <p className="text-xs text-slate-400 mt-1">Fill empty slots with AI (Coming Soon)</p>
            </div>
            <button
              onClick={() => setAddAiPlayers(!addAiPlayers)}
              disabled={true}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                addAiPlayers ? 'bg-blue-600' : 'bg-slate-600'
              } opacity-50 cursor-not-allowed`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  addAiPlayers ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div>
              <label className="text-sm font-semibold text-slate-300">Public Game</label>
              <p className="text-xs text-slate-400 mt-1">
                {isPublic ? 'Anyone can join' : 'Invite only'}
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-green-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGameModal;
