import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CreateGameModal from '../components/CreateGameModal';
import JoinGameModal from '../components/JoinGameModal';

interface GameLobby {
  game_id: string;
  game_mode: string;
  game_variant: string;
  player_count: number;
  max_players: number;
  is_public: boolean;
  host_user_id: string;
  status: string;
  created_at: string;
  host_username?: string;
  current_players?: number;
}

const GameLobby: React.FC = () => {
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState<GameLobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    fetchLobbies();

    // Set up realtime subscription for lobby updates
    const channel = supabase
      .channel('public-lobbies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: 'status=eq.waiting'
        },
        () => {
          fetchLobbies();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players'
        },
        () => {
          fetchLobbies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLobbies = async () => {
    try {
      setLoading(true);

      // Fetch all waiting games
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (gamesError) throw gamesError;

      // Fetch host usernames and player counts
      const gamesWithDetails = await Promise.all(
        (games || []).map(async (game) => {
          // Get host display name (or username as fallback)
          const { data: hostData } = await supabase
            .from('game_profiles')
            .select('display_name, username')
            .eq('user_id', game.host_user_id)
            .single();

          // Get current player count
          const { count: playerCount } = await supabase
            .from('game_players')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', game.game_id);

          return {
            ...game,
            host_username: hostData?.display_name || hostData?.username || 'Unknown',
            current_players: playerCount || 0
          };
        })
      );

      setLobbies(gamesWithDetails);
    } catch (error) {
      console.error('Error fetching lobbies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = (gameId: string) => {
    setSelectedGameId(gameId);
    setShowJoinModal(true);
  };

  const handleGameCreated = (gameId: string) => {
    navigate(`/lobby/${gameId}`);
  };

  const handleGameJoined = (gameId: string) => {
    navigate(`/lobby/${gameId}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Game Lobbies</h1>
            <p className="text-slate-400">Join an existing game or create your own</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Create Game
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Join with Code
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Lobbies List */}
            {lobbies.length === 0 ? (
              <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-2xl font-semibold text-slate-300 mb-2">No Active Lobbies</h3>
                <p className="text-slate-400">Be the first to create a game!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lobbies.map((lobby) => (
                  <div
                    key={lobby.game_id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer transform hover:scale-105 shadow-lg"
                    onClick={() => lobby.is_public && handleJoinLobby(lobby.game_id)}
                  >
                    {/* Game Mode Badge */}
                    <div
                      className={`inline-block px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getGameModeColor(lobby.game_mode)} mb-4`}
                    >
                      {getGameModeLabel(lobby.game_mode)}
                    </div>

                    {/* Game Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Host:</span>
                        <span className="font-semibold">{lobby.host_username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Players:</span>
                        <span className="font-semibold">
                          {lobby.current_players} / {lobby.max_players}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Variant:</span>
                        <span className="font-semibold capitalize">{lobby.game_variant}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Visibility:</span>
                        <span className="font-semibold">
                          {lobby.is_public ? (
                            <span className="text-green-400">Public</span>
                          ) : (
                            <span className="text-yellow-400">Private</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Join Button */}
                    {lobby.is_public ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinLobby(lobby.game_id);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                        disabled={(lobby.current_players ?? 0) >= lobby.max_players}
                      >
                        {(lobby.current_players ?? 0) >= lobby.max_players ? 'Full' : 'Join Game'}
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-slate-700 rounded-lg font-semibold text-center text-slate-400">
                        Private Game
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onGameCreated={handleGameCreated}
        />
      )}
      {showJoinModal && (
        <JoinGameModal
          onClose={() => {
            setShowJoinModal(false);
            setSelectedGameId(null);
          }}
          onGameJoined={handleGameJoined}
          preselectedGameId={selectedGameId}
        />
      )}
    </div>
  );
};

export default GameLobby;
