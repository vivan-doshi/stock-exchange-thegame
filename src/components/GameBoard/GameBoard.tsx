import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { STARTING_PRICES } from '../../lib/gameInitialization';
import TopBar from './TopBar';
import PortfolioPanel from './PortfolioPanel';
import StockGrid from './StockGrid';
import TransactionPanel from './TransactionPanel';
import BottomSection from './BottomSection';

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
  const [currentPlayerName, setCurrentPlayerName] = useState<string>('Loading...');

  useEffect(() => {
    if (gameId) {
      fetchGameData();
    }
  }, [gameId, user]);

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

      // Fetch current player's display name
      const { data: profile } = await supabase
        .from('game_profiles')
        .select('display_name, username')
        .eq('user_id', user?.id)
        .single();

      setCurrentPlayerName(profile?.display_name || profile?.username || 'Player');

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching game data:', err);
      setError(err.message);
      setLoading(false);
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

    return {
      company: COMPANY_INFO[symbol].name,
      sector: COMPANY_INFO[symbol].sector,
      price: currentPrice,
      priceChange,
      startPrice,
      availableShares,
      yourShares,
      ownershipLevel,
      color: COMPANY_INFO[symbol].color
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

          {/* Right Column - Transaction Panel (25%) */}
          <div className="lg:col-span-3">
            <TransactionPanel
              isDirector={(playerData.director_of || []).length > 0}
              isChairman={(playerData.chairman_of || []).length > 0}
              canAct={true}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section - Card Reveal & Transaction Log */}
      <BottomSection
        revealedCards={[]}
        recentTransactions={[]}
      />
    </div>
  );
};

export default GameBoard;
