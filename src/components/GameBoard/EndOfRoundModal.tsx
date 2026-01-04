import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { supabase } from '../../lib/supabase';
import { calculateNewPrices, applyNewPrices, PriceChangeResult } from '../../lib/game/endOfRoundService';
import { playCard } from '../../lib/game/actions';
import { cn } from '../../lib/utils';
import { Card } from '../../types';

interface EndOfRoundModalProps {
    isOpen: boolean;
    gameId: string;
    currentRound: number;
    isHost: boolean;
    onClose: () => void;
    onNextRound: () => void;
}

// Removed local PriceChange interface in favor of PriceChangeResult

export const EndOfRoundModal: React.FC<EndOfRoundModalProps> = ({
    isOpen,
    gameId,
    currentRound,
    isHost,
    onClose,
    onNextRound
}) => {
    const [loading, setLoading] = useState(false);
    const [priceChanges, setPriceChanges] = useState<PriceChangeResult[]>([]);
    const [shareSuspendedCards, setShareSuspendedCards] = useState<{ playerId: string, cardId: string }[]>([]);
    const [selectedStockToSuspend, setSelectedStockToSuspend] = useState<string>('');

    useEffect(() => {
        if (isOpen && gameId) {
            calculatePrices();
        }
    }, [isOpen, gameId]);

    const calculatePrices = async () => {
        setLoading(true);
        try {
            const results = await calculateNewPrices(gameId);
            setPriceChanges(results);

            // Check for Share Suspended cards
            const { data: players } = await supabase
                .from('game_players')
                .select('player_id, current_cards')
                .eq('game_id', gameId);

            const suspendedCards: { playerId: string, cardId: string }[] = [];
            players?.forEach(p => {
                const cards = p.current_cards as Card[] || [];
                cards.forEach(c => {
                    if (c.type === 'share-suspended') {
                        suspendedCards.push({ playerId: p.player_id, cardId: c.id });
                    }
                });
            });
            setShareSuspendedCards(suspendedCards);

        } catch (err) {
            console.error('Error calculating prices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendShare = async (stockSymbol: string, cardId: string, playerId: string) => {
        // Logic: Reset this stock's newPrice to its original starting price (or 100? Need to fetch Company data).
        // Let's simplified: Cancel the price change for this round (newPrice = oldPrice).

        setPriceChanges(prev => prev.map(p => {
            if (p.symbol === stockSymbol) {
                return { ...p, newPrice: p.oldPrice, change: 0 }; // effectively cancelled
            }
            return p;
        }));

        // Remove used card from local state
        setShareSuspendedCards(prev => prev.filter(c => c.cardId !== cardId));

        // Call API to remove card from DB
        try {
            // we construct a partial card object since we only need id and type
            await playCard(gameId, playerId, { id: cardId, type: 'share-suspended' } as Card);
        } catch (e) {
            console.error('Failed to remove suspended card from DB', e);
        }
    };

    const handleApplyChanges = async () => {
        setLoading(true);
        try {
            await applyNewPrices(gameId, priceChanges);
            onNextRound();
        } catch (err) {
            console.error('Error applying prices:', err);
            alert('Failed to apply changes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={() => { }} className="relative z-50">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                    <Dialog.Title className="text-2xl font-bold text-white mb-6 flex justify-between">
                        <span>End of Round {currentRound}</span>
                        <span className="text-sm font-normal text-slate-400">Market Closing...</span>
                    </Dialog.Title>

                    <div className="space-y-6">
                        {/* Price Changes Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {priceChanges.map((stock) => (
                                <div key={stock.symbol} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <h3 className="text-slate-400 text-sm font-medium mb-1 uppercase">{stock.symbol.replace('_', ' ')}</h3>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-2xl font-bold text-white">${stock.newPrice}</span>
                                        <span className={cn(
                                            "font-mono font-bold",
                                            stock.change > 0 ? "text-green-500" : stock.change < 0 ? "text-red-500" : "text-slate-500"
                                        )}>
                                            {stock.change > 0 ? '+' : ''}{stock.change}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Was ${stock.oldPrice}</div>
                                </div>
                            ))}
                        </div>

                        {/* Special Cards Section */}
                        {shareSuspendedCards.length > 0 && (
                            <div className="bg-slate-800 p-4 rounded-xl border border-yellow-500/30">
                                <h3 className="text-yellow-400 font-bold mb-2">Share Suspended Cards Available</h3>
                                <p className="text-slate-400 text-sm mb-4">Players can use these cards to cancel price changes for a specific stock.</p>

                                {shareSuspendedCards.map((card, idx) => (
                                    <div key={card.cardId} className="flex gap-2 items-center mb-2">
                                        <span className="text-sm text-slate-300">Player {card.playerId.substr(0, 4)}...</span>
                                        <select
                                            className="bg-slate-700 text-white text-sm rounded px-2 py-1"
                                            onChange={(e) => setSelectedStockToSuspend(e.target.value)}
                                            value={selectedStockToSuspend}
                                        >
                                            <option value="">Select Stock</option>
                                            {priceChanges.map(p => (
                                                <option key={p.symbol} value={p.symbol}>{p.symbol}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleSuspendShare(selectedStockToSuspend, card.cardId, card.playerId)}
                                            disabled={!selectedStockToSuspend}
                                            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white text-xs px-3 py-1 rounded"
                                        >
                                            Suspend Share
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions / Next Steps */}
                        <div className="flex justify-end pt-6 border-t border-slate-700 gap-3">
                            {isHost ? (
                                <button
                                    onClick={handleApplyChanges}
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
                                >
                                    {loading ? 'Processing...' : 'Start Next Round'}
                                </button>
                            ) : (
                                <div className="text-slate-400 italic py-3">Waiting for host to advance round...</div>
                            )}
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
