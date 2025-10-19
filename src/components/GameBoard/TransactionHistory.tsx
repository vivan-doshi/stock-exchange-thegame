import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Transaction {
  transaction_id: string;
  player_name: string;
  transaction_type: string;
  stock_symbol: string | null;
  quantity: number | null;
  price_per_share: number | null;
  total_amount: number;
  created_at: string;
  round_number: number;
  transaction_number: number;
}

interface TransactionHistoryProps {
  gameId: string;
  currentRound: number;
  refreshTrigger?: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ gameId, currentRound, refreshTrigger }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    const cleanup = subscribeToTransactions();
    return cleanup;
  }, [gameId, currentRound, refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      console.log('[TransactionHistory] Fetching transactions for game:', gameId, 'round:', currentRound);

      // First, get ALL transactions for this game (not just current round for debugging)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('transaction_id, transaction_type, stock_symbol, quantity, price_per_share, total_amount, created_at, round_number, transaction_number, player_id, game_id')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError) {
        console.error('[TransactionHistory] Error fetching transactions:', txError);
        throw txError;
      }

      console.log('[TransactionHistory] Raw transaction data:', txData);

      if (!txData || txData.length === 0) {
        console.log('[TransactionHistory] No transactions found');
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Get player IDs
      const playerIds = [...new Set(txData.map(t => t.player_id))];
      console.log('[TransactionHistory] Player IDs:', playerIds);

      // Fetch player data
      const { data: playerData, error: playerError } = await supabase
        .from('game_players')
        .select('player_id, user_id')
        .in('player_id', playerIds);

      console.log('[TransactionHistory] Player data:', playerData, 'Error:', playerError);

      // Get user IDs
      const userIds = playerData?.map(p => p.user_id) || [];
      console.log('[TransactionHistory] User IDs:', userIds);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('game_profiles')
        .select('user_id, display_name, username')
        .in('user_id', userIds);

      console.log('[TransactionHistory] Profile data:', profileData, 'Error:', profileError);

      // Create lookup maps
      const playerMap = new Map(playerData?.map(p => [p.player_id, p.user_id]) || []);
      const profileMap = new Map(profileData?.map(p => [p.user_id, p]) || []);

      const formattedTransactions = txData.map((t: any) => {
        const userId = playerMap.get(t.player_id);
        const profile = userId ? profileMap.get(userId) : null;

        return {
          transaction_id: t.transaction_id,
          player_name: profile?.username || profile?.display_name || 'Unknown Player',
          transaction_type: t.transaction_type,
          stock_symbol: t.stock_symbol,
          quantity: t.quantity,
          price_per_share: t.price_per_share,
          total_amount: t.total_amount,
          created_at: t.created_at,
          round_number: t.round_number,
          transaction_number: t.transaction_number
        };
      });

      console.log('[TransactionHistory] Formatted transactions:', formattedTransactions);

      setTransactions(formattedTransactions);
      setLoading(false);
    } catch (error) {
      console.error('[TransactionHistory] Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const subscribeToTransactions = () => {
    console.log('[TransactionHistory] Setting up subscription for game:', gameId);
    const channel = supabase
      .channel(`transactions-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('[TransactionHistory] New transaction inserted:', payload);
          // Refresh transactions when a new one is added
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy_shares':
        return '📈';
      case 'sell_shares':
        return '📉';
      case 'card_effect':
        return '⏭️'; // Pass
      default:
        return '💼';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'buy_shares':
        return 'Bought';
      case 'sell_shares':
        return 'Sold';
      case 'card_effect':
        return 'Passed';
      default:
        return type;
    }
  };

  const formatStockName = (symbol: string | null) => {
    if (!symbol) return '';
    const names: Record<string, string> = {
      atlas_bank: 'Atlas Bank',
      titan_steel: 'Titan Steel',
      global_industries: 'Global Industries',
      omega_energy: 'Omega Energy',
      vitalcare_pharma: 'VitalCare Pharma',
      novatech: 'NovaTech'
    };
    return names[symbol] || symbol;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatQuantity = (qty: number | null) => {
    if (!qty) return '';
    return new Intl.NumberFormat('en-US').format(qty);
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3">RECENT ACTIVITY</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
        <span>📋</span>
        RECENT ACTIVITY
        <span className="text-xs font-normal text-slate-500">(Round {currentRound})</span>
      </h3>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No transactions yet this round</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.transaction_id}
              className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getTransactionIcon(tx.transaction_type)}</span>
                    <span className="font-semibold text-white text-sm">{tx.player_name}</span>
                    <span className="text-slate-400 text-xs">
                      {getTransactionLabel(tx.transaction_type)}
                    </span>
                  </div>

                  {tx.stock_symbol && (
                    <div className="ml-7 text-sm">
                      <div className="text-slate-300">
                        {formatQuantity(tx.quantity)} shares of{' '}
                        <span className="font-medium text-blue-400">
                          {formatStockName(tx.stock_symbol)}
                        </span>
                      </div>
                      {tx.price_per_share && (
                        <div className="text-slate-500 text-xs mt-0.5">
                          @ {formatCurrency(tx.price_per_share)} per share
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    tx.transaction_type === 'buy_shares' ? 'text-red-400' :
                    tx.transaction_type === 'sell_shares' ? 'text-green-400' :
                    'text-slate-400'
                  }`}>
                    {tx.transaction_type === 'buy_shares' && '-'}
                    {tx.transaction_type === 'sell_shares' && '+'}
                    {tx.total_amount !== 0 && formatCurrency(Math.abs(tx.total_amount))}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    R{tx.round_number} T{tx.transaction_number}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
