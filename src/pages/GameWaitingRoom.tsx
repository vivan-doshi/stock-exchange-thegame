import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Player {
  player_id: string;
  user_id: string;
  player_position: number;
  is_ready: boolean;
  is_host: boolean;
  username?: string;
  avatar_url?: string;
}

interface GameData {
  game_id: string;
  game_mode: string;
  game_variant: string;
  max_players: number;
  is_public: boolean;
  host_user_id: string;
  status: string;
}

const GameWaitingRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!gameId) {
      navigate('/lobby');
      return;
    }

    fetchGameData();

    // Set up realtime subscription for game updates
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchGameData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          // If game status changed to in_progress, navigate to game
          if (payload.new.status === 'in_progress') {
            navigate(`/game/${gameId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, navigate]);

  const fetchGameData = async () => {
    if (!gameId || !user) return;

    try {
      // Fetch game details
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (gameError) throw gameError;

      if (!gameData) {
        setError('Game not found');
        setLoading(false);
        return;
      }

      setGame(gameData);
      setIsHost(gameData.host_user_id === user.id);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .order('player_position', { ascending: true });

      if (playersError) throw playersError;

      // Fetch display names (or usernames) for all players
      const playersWithDetails = await Promise.all(
        (playersData || []).map(async (player) => {
          const { data: userData } = await supabase
            .from('game_profiles')
            .select('display_name, username')
            .eq('user_id', player.user_id)
            .single();

          return {
            ...player,
            username: userData?.display_name || userData?.username || 'Anonymous'
          };
        })
      );

      setPlayers(playersWithDetails);

      // Find current player
      const current = playersWithDetails.find((p) => p.user_id === user.id);
      setCurrentPlayer(current || null);

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching game data:', err);
      setError(err.message || 'Failed to load game');
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!currentPlayer || !gameId) return;

    try {
      const { error } = await supabase
        .from('game_players')
        .update({ is_ready: !currentPlayer.is_ready })
        .eq('player_id', currentPlayer.player_id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error toggling ready:', err);
    }
  };

  const handleStartGame = async () => {
    if (!isHost || !gameId) return;

    // Check if at least 2 players are ready
    const readyPlayers = players.filter((p) => p.is_ready);
    if (readyPlayers.length < 2) {
      alert('At least 2 players must be ready to start the game');
      return;
    }

    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: 'in_progress',
          current_round: 1,
          current_transaction: 1
        })
        .eq('game_id', gameId);

      if (error) throw error;

      // The realtime subscription will navigate to the game
    } catch (err: any) {
      console.error('Error starting game:', err);
      alert('Failed to start game: ' + err.message);
    }
  };

  const handleLeaveGame = async () => {
    if (!currentPlayer || !gameId) return;

    const confirmLeave = window.confirm(
      isHost
        ? 'You are the host. Leaving will delete this game. Are you sure?'
        : 'Are you sure you want to leave this game?'
    );

    if (!confirmLeave) return;

    try {
      if (isHost) {
        // Delete all players first
        await supabase
          .from('game_players')
          .delete()
          .eq('game_id', gameId);

        // Delete the game
        await supabase
          .from('games')
          .delete()
          .eq('game_id', gameId);
      } else {
        // Just remove this player
        await supabase
          .from('game_players')
          .delete()
          .eq('player_id', currentPlayer.player_id);
      }

      navigate('/lobby');
    } catch (err: any) {
      console.error('Error leaving game:', err);
      alert('Failed to leave game: ' + err.message);
    }
  };

  const copyGameCode = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      alert('Game code copied to clipboard!');
    }
  };

  const getGameModeLabel = (mode: string) => {
    const modeLabels: { [key: string]: string } = {
      trader: 'Trader',
      investor: 'Investor',
      strategist: 'Strategist'
    };
    return modeLabels[mode] || mode;
  };

  const getGameModeColor = (mode: string) => {
    const modeColors: { [key: string]: string } = {
      trader: 'from-blue-500 to-blue-700',
      investor: 'from-green-500 to-green-700',
      strategist: 'from-purple-500 to-purple-700'
    };
    return modeColors[mode] || 'from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Game not found'}</p>
          <button
            onClick={() => navigate('/lobby')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const readyCount = players.filter((p) => p.is_ready).length;
  const canStartGame = isHost && readyCount >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">Waiting Room</h1>
            <button
              onClick={() => navigate('/lobby')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Back to Lobby
            </button>
          </div>

          {/* Game Mode Badge */}
          <div
            className={`inline-block px-6 py-2 rounded-full text-lg font-semibold bg-gradient-to-r ${getGameModeColor(game.game_mode)} mb-4`}
          >
            {getGameModeLabel(game.game_mode)} - {game.game_variant.charAt(0).toUpperCase() + game.game_variant.slice(1)}
          </div>
        </div>

        {/* Game Code */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Game Code</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-slate-800 rounded-lg text-blue-400 font-mono text-sm">
              {gameId}
            </code>
            <button
              onClick={copyGameCode}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              Copy Code
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Share this code with friends to invite them to the game
          </p>
        </div>

        {/* Players List */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Players ({players.length}/{game.max_players})
            </h2>
            <span className="text-sm text-slate-400">
              {readyCount} Ready
            </span>
          </div>

          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.player_id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  player.user_id === user?.id
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : 'bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                    {player.username?.charAt(0).toUpperCase() || 'A'}
                  </div>

                  {/* Player Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{player.username}</span>
                      {player.is_host && (
                        <span className="px-2 py-0.5 bg-yellow-600 text-xs rounded-full">
                          Host
                        </span>
                      )}
                      {player.user_id === user?.id && (
                        <span className="px-2 py-0.5 bg-blue-600 text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Player {player.player_position}</span>
                  </div>
                </div>

                {/* Ready Status */}
                <div className="flex items-center gap-2">
                  {player.is_ready ? (
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Ready
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold">Not Ready</span>
                  )}
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: game.max_players - players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-dashed border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-slate-500">?</span>
                  </div>
                  <span className="text-slate-500">Waiting for player...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {/* Ready Toggle */}
          {currentPlayer && (
            <button
              onClick={handleToggleReady}
              className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                currentPlayer.is_ready
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
              }`}
            >
              {currentPlayer.is_ready ? 'Not Ready' : 'Ready'}
            </button>
          )}

          {/* Start Game (Host Only) */}
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                canStartGame
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-slate-700 opacity-50 cursor-not-allowed'
              }`}
            >
              Start Game
            </button>
          )}

          {/* Leave Game */}
          <button
            onClick={handleLeaveGame}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
          >
            Leave
          </button>
        </div>

        {/* Start Game Info */}
        {isHost && !canStartGame && (
          <p className="text-center text-slate-400 text-sm mt-4">
            At least 2 players must be ready to start the game
          </p>
        )}
      </div>
    </div>
  );
};

export default GameWaitingRoom;
