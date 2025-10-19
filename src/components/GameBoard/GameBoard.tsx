import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { STARTING_PRICES } from '../../lib/gameInitialization';
import { executeBuyTransaction, executeSellTransaction, executePassTransaction, advanceTransaction } from '../../lib/game/transactionService';
import { getCurrentTurnInfo } from '../../lib/game/turnManager';
import TopBar from './TopBar';
import PortfolioPanel from './PortfolioPanel';
import StockGrid from './StockGrid';
import TransactionPanel from './TransactionPanel';
import BottomSection from './BottomSection';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import TransactionHistory from './TransactionHistory';

interface GameBoardProps {
  gameId?: string;
}

// Company metadata
const COMPANY_INFO: Record<string, { name: string; sector: string; color: string }> = {
  atlas_bank: { name: 'Atlas Bank', sector: 'Banking & Financial Services', color: 'blue' },
  titan_steel: { name: 'Titan Steel', sector: 'Manufacturing & Industrial', color: 'gray' },
  global_industries: { name: 'Global Industries', sector: 'Conglomerate', color: 'teal' },
  omega_energy: { name: 'Omega Energy', sector: 'Energy & Power', color: 'orange' },
  vitalcare_pharma: { name: 'VitalCare Pharma', sector: 'Healthcare & Pharmaceuticals', color: 'green' },
  novatech: { name: 'NovaTech', sector: 'Technology & Innovation', color: 'purple' }
};

const GameBoard: React.FC<GameBoardProps> = () => {
  const { gameId: routeGameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const gameId = routeGameId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>('Loading...');
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [transactionRefreshTrigger, setTransactionRefreshTrigger] = useState(0);
  const [recentTransactionsForBottom, setRecentTransactionsForBottom] = useState<any[]>([]);

  // Modal states
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (gameId) {
      fetchGameData();
    }
  }, [gameId, user]);

  // Real-time subscription for game state changes
  useEffect(() => {
    if (!gameId) return;

    // Subscribe to game state updates
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `game_id=eq.${gameId}`
        },
        async (payload) => {
          console.log('[GameBoard] Game state updated:', payload);
          console.log('[GameBoard] New current_player_position:', payload.new?.current_player_position);
          console.log('[GameBoard] New dealer_position:', payload.new?.dealer_position);
          setGameData(payload.new);

          // ONLY refresh turn info if we're not currently processing a transaction
          // This prevents race conditions where player updates overwrite our turn state
          if (user?.id && gameId && !isProcessing) {
            console.log('[GameBoard] Fetching turn info for user:', user.id);
            const turnInfo = await getCurrentTurnInfo(gameId, user.id);
            console.log('[GameBoard] Turn info received:', turnInfo);
            if (turnInfo) {
              setCurrentPlayerName(turnInfo.currentPlayerName);
              setIsYourTurn(turnInfo.isYourTurn);
              console.log('[GameBoard] Turn updated - Current player:', turnInfo.currentPlayerName, 'Is your turn:', turnInfo.isYourTurn);
            }
          }
          // Refresh transaction history when game state changes
          setTransactionRefreshTrigger(prev => prev + 1);
          // Also refresh bottom transactions
          fetchRecentTransactions();
        }
      )
      .subscribe();

    // Subscribe to player updates
    const playerChannel = supabase
      .channel(`players-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${gameId}`
        },
        async (payload) => {
          console.log('[GameBoard] Player data updated:', payload);
          // If this is the current player's update, refresh player data
          if (payload.new.user_id === user?.id) {
            console.log('[GameBoard] Current player updated, refreshing player data');
            setPlayerData(payload.new);
          }

          // Also refresh ALL players data for share ownership display
          // This fixes the delay in shareholder display
          const { data: allPlayersData } = await supabase
            .from('game_players')
            .select('player_id, user_id, stock_holdings')
            .eq('game_id', gameId);

          if (allPlayersData) {
            const userIds = allPlayersData.map(p => p.user_id);
            const { data: profiles } = await supabase
              .from('game_profiles')
              .select('user_id, username, display_name')
              .in('user_id', userIds);

            const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
            const playersWithProfiles = allPlayersData.map(p => ({
              ...p,
              username: profileMap.get(p.user_id)?.username || profileMap.get(p.user_id)?.display_name || 'Player'
            }));

            setAllPlayers(playersWithProfiles);
            console.log('[GameBoard] Updated all players data for share display');
          }

          // ONLY refresh turn info if we're not currently processing a transaction
          // This prevents race conditions where player updates overwrite our turn state
          if (user?.id && gameId && !isProcessing) {
            const turnInfo = await getCurrentTurnInfo(gameId, user.id);
            if (turnInfo) {
              setCurrentPlayerName(turnInfo.currentPlayerName);
              setIsYourTurn(turnInfo.isYourTurn);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playerChannel);
    };
  }, [gameId, user, isProcessing]);

  const fetchGameData = async () => {
    try {
      // Fetch game state
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (gameError) throw gameError;
      setGameData(game);

      // Fetch current player data
      const { data: player, error: playerError } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', user?.id)
        .single();

      if (playerError) throw playerError;
      setPlayerData(player);

      // Fetch ALL players data for share ownership display
      const { data: players, error: playersError } = await supabase
        .from('game_players')
        .select('player_id, user_id, stock_holdings')
        .eq('game_id', gameId);

      if (playersError) {
        console.error('Error fetching all players:', playersError);
      } else {
        // Get profile data for all players
        const userIds = players?.map(p => p.user_id) || [];
        const { data: profiles } = await supabase
          .from('game_profiles')
          .select('user_id, username, display_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Merge player data with profile data
        const playersWithProfiles = players?.map(p => ({
          ...p,
          username: profileMap.get(p.user_id)?.username || profileMap.get(p.user_id)?.display_name || 'Player'
        })) || [];

        setAllPlayers(playersWithProfiles);
      }

      // Fetch turn information
      if (gameId && user?.id) {
        const turnInfo = await getCurrentTurnInfo(gameId, user.id);
        if (turnInfo) {
          setCurrentPlayerName(turnInfo.currentPlayerName);
          setIsYourTurn(turnInfo.isYourTurn);
        }
      }

      // Fetch recent transactions for bottom section
      await fetchRecentTransactions();

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching game data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      // Fetch last 10 transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('transaction_id, transaction_type, stock_symbol, quantity, price_per_share, total_amount, created_at, player_id')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError || !txData) {
        console.error('Error fetching transactions for bottom:', txError);
        return;
      }

      // Get player info
      const playerIds = [...new Set(txData.map(t => t.player_id))];
      const { data: playerData } = await supabase
        .from('game_players')
        .select('player_id, user_id')
        .in('player_id', playerIds);

      const userIds = playerData?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('game_profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      const playerMap = new Map(playerData?.map(p => [p.player_id, p.user_id]) || []);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Format transactions
      const formatted = txData.map(tx => {
        const userId = playerMap.get(tx.player_id);
        const profile = userId ? profileMap.get(userId) : null;
        const playerName = profile?.username || profile?.display_name || 'Player';

        let action = '';
        if (tx.transaction_type === 'buy_shares') {
          action = `Bought ${tx.quantity?.toLocaleString()} shares of ${tx.stock_symbol?.replace('_', ' ').toUpperCase()}`;
        } else if (tx.transaction_type === 'sell_shares') {
          action = `Sold ${tx.quantity?.toLocaleString()} shares of ${tx.stock_symbol?.replace('_', ' ').toUpperCase()}`;
        } else if (tx.transaction_type === 'card_effect') {
          action = 'Passed turn';
        }

        const timestamp = new Date(tx.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });

        return {
          player: playerName,
          action,
          timestamp
        };
      });

      setRecentTransactionsForBottom(formatted);
    } catch (error) {
      console.error('Error in fetchRecentTransactions:', error);
    }
  };

  // Transaction handlers
  const handleBuyConfirm = async (stockSymbol: string, quantity: number) => {
    if (!gameId || !playerData?.player_id || isProcessing) return;

    // Extra safety check - verify it's still our turn
    if (!isYourTurn) {
      console.log('[handleBuyConfirm] Blocked - not your turn anymore');
      alert('It is not your turn');
      setIsBuyModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await executeBuyTransaction(
        gameId,
        playerData.player_id,
        stockSymbol,
        quantity
      );

      if (result.success) {
        // Close the modal
        setIsBuyModalOpen(false);

        // IMPORTANT: Immediately set isYourTurn to false to prevent rapid double-clicks
        // before real-time subscription updates the state
        setIsYourTurn(false);

        // Advance to next transaction
        await advanceTransaction(gameId);

        // Wait a moment for database to commit
        await new Promise(resolve => setTimeout(resolve, 300));

        // Manually refresh turn info after transaction completes
        if (user?.id && gameId) {
          const turnInfo = await getCurrentTurnInfo(gameId, user.id);
          if (turnInfo) {
            setCurrentPlayerName(turnInfo.currentPlayerName);
            setIsYourTurn(turnInfo.isYourTurn);
            console.log('[handleBuyConfirm] Turn refreshed - Current player:', turnInfo.currentPlayerName, 'Is your turn:', turnInfo.isYourTurn);
          }
        }

        // Data will also update via real-time subscription
      } else {
        alert(`Transaction failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error executing buy:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSellConfirm = async (stockSymbol: string, quantity: number) => {
    if (!gameId || !playerData?.player_id || isProcessing) return;

    // Extra safety check - verify it's still our turn
    if (!isYourTurn) {
      console.log('[handleSellConfirm] Blocked - not your turn anymore');
      alert('It is not your turn');
      setIsSellModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await executeSellTransaction(
        gameId,
        playerData.player_id,
        stockSymbol,
        quantity
      );

      if (result.success) {
        // Close the modal
        setIsSellModalOpen(false);

        // IMPORTANT: Immediately set isYourTurn to false to prevent rapid double-clicks
        // before real-time subscription updates the state
        setIsYourTurn(false);

        // Advance to next transaction
        await advanceTransaction(gameId);

        // Wait a moment for database to commit
        await new Promise(resolve => setTimeout(resolve, 300));

        // Manually refresh turn info after transaction completes
        if (user?.id && gameId) {
          const turnInfo = await getCurrentTurnInfo(gameId, user.id);
          if (turnInfo) {
            setCurrentPlayerName(turnInfo.currentPlayerName);
            setIsYourTurn(turnInfo.isYourTurn);
            console.log('[handleSellConfirm] Turn refreshed - Current player:', turnInfo.currentPlayerName, 'Is your turn:', turnInfo.isYourTurn);
          }
        }

        // Data will also update via real-time subscription
      } else {
        alert(`Transaction failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error executing sell:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePass = async () => {
    if (!gameId || !playerData?.player_id || isProcessing) return;

    // Extra safety check - verify it's still our turn
    if (!isYourTurn) {
      console.log('[handlePass] Blocked - not your turn anymore');
      alert('It is not your turn');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await executePassTransaction(gameId, playerData.player_id);

      if (result.success) {
        // IMPORTANT: Immediately set isYourTurn to false to prevent rapid double-clicks
        // before real-time subscription updates the state
        setIsYourTurn(false);

        // Advance to next transaction
        await advanceTransaction(gameId);

        // Wait a moment for database to commit
        await new Promise(resolve => setTimeout(resolve, 300));

        // Manually refresh turn info after transaction completes
        if (user?.id && gameId) {
          const turnInfo = await getCurrentTurnInfo(gameId, user.id);
          if (turnInfo) {
            setCurrentPlayerName(turnInfo.currentPlayerName);
            setIsYourTurn(turnInfo.isYourTurn);
            console.log('[handlePass] Turn refreshed - Current player:', turnInfo.currentPlayerName, 'Is your turn:', turnInfo.isYourTurn);
          }
        }

        // Data will also update via real-time subscription
      } else {
        alert(`Transaction failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error executing pass:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !gameData || !playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-slate-400">{error || 'Failed to load game'}</p>
        </div>
      </div>
    );
  }

  // Calculate portfolio values
  const stockHoldings = playerData.stock_holdings || {};
  const stockPrices = gameData.stock_prices || {};
  const shareSupply = gameData.share_supply || {};

  let stockValue = 0;
  const holdings = Object.entries(stockHoldings)
    .filter(([_, shares]) => (shares as number) > 0)
    .map(([symbol, shares]) => {
      const price = stockPrices[symbol] || 0;
      const value = (shares as number) * price;
      stockValue += value;
      return {
        company: COMPANY_INFO[symbol]?.name || symbol,
        shares: shares as number,
        value,
        color: COMPANY_INFO[symbol]?.color || 'gray'
      };
    });

  const cash = playerData.cash_balance || 0;
  const netWorth = cash + stockValue;

  // Prepare stock data for buy modal
  const stocksForBuy = Object.keys(COMPANY_INFO).map((symbol) => ({
    symbol,
    name: COMPANY_INFO[symbol].name,
    price: stockPrices[symbol] || STARTING_PRICES[symbol as keyof typeof STARTING_PRICES],
    availableShares: shareSupply[symbol] || 200000,
    color: COMPANY_INFO[symbol].color
  }));

  // Prepare owned stocks for sell modal
  const ownedStocks = Object.entries(stockHoldings)
    .filter(([_, shares]) => (shares as number) > 0)
    .map(([symbol, shares]) => ({
      symbol,
      name: COMPANY_INFO[symbol]?.name || symbol,
      price: stockPrices[symbol] || STARTING_PRICES[symbol as keyof typeof STARTING_PRICES],
      sharesOwned: shares as number,
      color: COMPANY_INFO[symbol]?.color || 'gray'
    }));

  // Prepare stock cards data
  const stocks = Object.keys(COMPANY_INFO).map((symbol) => {
    const currentPrice = stockPrices[symbol] || STARTING_PRICES[symbol as keyof typeof STARTING_PRICES];
    const startPrice = STARTING_PRICES[symbol as keyof typeof STARTING_PRICES];
    const priceChange = currentPrice - startPrice;
    const availableShares = shareSupply[symbol] || 200000;
    const yourShares = stockHoldings[symbol] || 0;

    // Check ownership levels
    const directorOf = playerData.director_of || [];
    const chairmanOf = playerData.chairman_of || [];
    let ownershipLevel: 'Director' | 'Chairman' | null = null;
    if (chairmanOf.includes(symbol)) {
      ownershipLevel = 'Chairman';
    } else if (directorOf.includes(symbol)) {
      ownershipLevel = 'Director';
    }

    // Get all players' holdings for this stock
    const playerHoldings = allPlayers.map(p => ({
      username: p.username,
      shares: p.stock_holdings?.[symbol] || 0,
      isCurrentUser: p.user_id === user?.id
    })).filter(h => h.shares > 0);

    if (symbol === 'atlas_bank') {
      console.log('[GameBoard] Atlas Bank - allPlayers:', allPlayers);
      console.log('[GameBoard] Atlas Bank - playerHoldings:', playerHoldings);
    }

    return {
      company: COMPANY_INFO[symbol].name,
      sector: COMPANY_INFO[symbol].sector,
      price: currentPrice,
      priceChange,
      startPrice,
      availableShares,
      yourShares,
      ownershipLevel,
      color: COMPANY_INFO[symbol].color,
      playerHoldings
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top Bar */}
      <TopBar
        currentRound={gameData.current_round || 1}
        totalRounds={gameData.rounds_total || 10}
        currentTransaction={gameData.current_transaction || 1}
        totalTransactions={3}
        currentPlayerName={currentPlayerName}
      />

      {/* Main Game Area */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Portfolio (25%) */}
          <div className="lg:col-span-3">
            <PortfolioPanel
              cash={cash}
              stockValue={stockValue}
              netWorth={netWorth}
              holdings={holdings}
            />
          </div>

          {/* Center Column - Stock Cards (50%) */}
          <div className="lg:col-span-6">
            <StockGrid stocks={stocks} />
          </div>

          {/* Right Column - Transaction Panel & History (25%) */}
          <div className="lg:col-span-3 space-y-4">
            <TransactionPanel
              isDirector={(playerData.director_of || []).length > 0}
              isChairman={(playerData.chairman_of || []).length > 0}
              canAct={!isProcessing && isYourTurn}
              onBuy={() => setIsBuyModalOpen(true)}
              onSell={() => setIsSellModalOpen(true)}
              onPass={handlePass}
              isYourTurn={isYourTurn}
              currentPlayerName={currentPlayerName}
            />
            <TransactionHistory
              gameId={gameId || ''}
              currentRound={gameData?.current_round || 1}
              refreshTrigger={transactionRefreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section - Card Reveal & Transaction Log */}
      <BottomSection
        revealedCards={[]}
        recentTransactions={recentTransactionsForBottom}
      />

      {/* Modals */}
      <BuyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        stocks={stocksForBuy}
        playerCash={cash}
        onConfirm={handleBuyConfirm}
      />

      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        ownedStocks={ownedStocks}
        onConfirm={handleSellConfirm}
      />
    </div>
  );
};

export default GameBoard;
