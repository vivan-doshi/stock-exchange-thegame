import { supabase } from '../supabase';
import { Card, GameVariant, Company, GameState } from '../../types';

export interface PriceChangeResult {
    symbol: string;
    oldPrice: number;
    newPrice: number;
    change: number;
    cards: { playerId: string; cardValue: number }[];
}

export async function calculateNewPrices(gameId: string): Promise<PriceChangeResult[]> {
    console.log('[EndOfRoundService] Calculating new prices for game:', gameId);

    // 1. Fetch Game State (Prices)
    const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

    if (gameError || !game) throw new Error('Failed to fetch game state');

    // 2. Fetch All Players and their Cards
    const { data: players, error: playersError } = await supabase
        .from('game_players')
        .select('player_id, current_cards')
        .eq('game_id', gameId);

    if (playersError || !players) throw new Error('Failed to fetch players');

    const currentPrices = game.stock_prices as Record<string, number>;
    const symbols = Object.keys(currentPrices);
    const results: PriceChangeResult[] = [];

    // 3. Calculate Change for each Stock
    for (const symbol of symbols) {
        let totalChange = 0;
        const contributingCards: { playerId: string; cardValue: number }[] = [];

        players.forEach(player => {
            const cards = (player.current_cards as Card[]) || [];
            const stockCards = cards.filter(c => c.type === 'price' && c.companyId === symbol);

            stockCards.forEach(c => {
                // Check if director/chairman removed this card (TODO: Implement power logic here later)
                // For now, assume all cards count
                const val = c.value || 0;
                totalChange += val;
                contributingCards.push({ playerId: player.player_id, cardValue: val });
            });
        });

        const oldPrice = currentPrices[symbol];
        let newPrice = oldPrice + totalChange;

        // Price floors/ceilings? Usually simply 0 is floor.
        if (newPrice < 0) newPrice = 0;

        results.push({
            symbol,
            oldPrice,
            newPrice,
            change: totalChange,
            cards: contributingCards
        });
    }

    return results;
}

export async function applyNewPrices(gameId: string, priceResults: PriceChangeResult[]) {
    // Construct new price object
    const newPrices: Record<string, number> = {};
    priceResults.forEach(r => {
        newPrices[r.symbol] = r.newPrice;
    });

    const { error } = await supabase
        .from('games')
        .update({
            stock_prices: newPrices,
            // Reset transaction state for next round? No, finalizeRound does that.
        })
        .eq('game_id', gameId);

    if (error) throw error;
}

export async function setGamePhase(gameId: string, phase: 'trading' | 'end_of_round') {
    const { error } = await supabase
        .from('games')
        .update({ phase })
        .eq('game_id', gameId);

    if (error) throw error;
}

export async function finalizeRound(gameId: string) {
    // 1. Fetch current game state to determine next dealer
    const { data: game } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

    if (!game) throw new Error('Game not found');

    const playerCount = game.player_count;
    const currentRound = game.current_round;
    const totalRounds = game.rounds_total;
    const currentDealerPosition = game.dealer_position || 1;

    // 2. Calculate next positions
    const nextDealerPosition = (currentDealerPosition % playerCount) + 1;
    const firstPlayerOfRound = (nextDealerPosition % playerCount) + 1;

    // 3. Update Game State
    // - Increment Round
    // - Reset Transaction to 1
    // - Rotate Dealer
    // - Set Phase back to 'trading'

    const { error } = await supabase
        .from('games')
        .update({
            current_round: currentRound + 1,
            current_transaction: 1,
            dealer_position: nextDealerPosition,
            current_player_position: firstPlayerOfRound,
            phase: 'trading'
        })
        .eq('game_id', gameId);

    if (error) throw error;
}
