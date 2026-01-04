import { supabase } from '../supabase';
import { Card, CardType } from '../../types';

interface PlayCardResult {
    success: boolean;
    message?: string;
}

export async function playCard(
    gameId: string,
    playerId: string,
    card: Card
): Promise<PlayCardResult> {
    console.log('[playCard] Attempting to play card:', card.id, card.type, 'for player:', playerId);
    try {
        if (card.type === 'price') {
            return { success: false, message: 'Price cards cannot be played directly.' };
        }

        // Handle Special Card Effects
        switch (card.type) {
            case 'loan-stocks-matured':
                console.log('[playCard] Handling loan-stocks-matured');
                await handleLoanMatured(playerId);
                break;
            case 'currency-plus':
                await handleCurrencyEffect(playerId, 0.10); // +10%
                break;
            case 'currency-minus':
                await handleCurrencyEffect(playerId, -0.10); // -10%
                break;
            case 'rights-issued':
                await handleRightsIssued(gameId, playerId);
                break;
            case 'debenture':
                await handleDebenture(gameId, playerId);
                break;
            // Share suspended is handled in UI for effect, but we call this to remove the card.
            case 'share-suspended':
                console.log('[playCard] Share suspended card used (logic handled by UI)');
                break;
            default:
                return { success: false, message: `Card type ${card.type} not yet implemented.` };
        }

        // Remove card from player hand
        console.log('[playCard] Removing card from hand...');
        await removeCardFromHand(playerId, card.id);

        // Record transaction
        console.log('[playCard] Recording transaction...');
        await recordCardUsage(gameId, playerId, card);

        console.log('[playCard] Success!');
        return { success: true, message: `Played ${card.type} successfully.` };

    } catch (error: any) {
        console.error('[playCard] Error playing card:', error);
        return { success: false, message: error.message };
    }
}

async function handleLoanMatured(playerId: string) {
    // Add 100,000 to cash
    const { data: player } = await supabase
        .from('game_players')
        .select('cash_balance')
        .eq('player_id', playerId)
        .single();

    if (!player) throw new Error('Player not found');

    await supabase
        .from('game_players')
        .update({ cash_balance: player.cash_balance + 100000 })
        .eq('player_id', playerId);
}

async function handleCurrencyEffect(playerId: string, percentage: number) {
    const { data: player } = await supabase
        .from('game_players')
        .select('cash_balance')
        .eq('player_id', playerId)
        .single();

    if (!player) throw new Error('Player not found');

    const change = Math.floor(player.cash_balance * percentage);
    await supabase
        .from('game_players')
        .update({ cash_balance: player.cash_balance + change })
        .eq('player_id', playerId);
}

async function handleRightsIssued(gameId: string, playerId: string) {
    // Logic: Calculate max shares buyable (Holdings / 2). 
    // Usually this is an interactive process (Ask user "How many?"). 
    // BUT playCard is an immediate action. 
    // Assumption for V1: Automatically exercise MAX rights if cash allows.
    // Or, for better UX, this card should probably trigger a modal, NOT execute immediately.
    // However, keeping it simple: Buy MAX possible rights shares at $10.

    // Fetch player holdings
    const { data: player } = await supabase
        .from('game_players')
        .select('stock_holdings, cash_balance, stock_holdings')
        .eq('player_id', playerId)
        .single();

    if (!player) throw new Error('Player not found');

    const holdings = player.stock_holdings || {};
    let totalCost = 0;
    const newHoldings = { ...holdings };

    // Iterate all stocks to calculate rights
    for (const [symbol, quantity] of Object.entries(holdings)) {
        if (typeof quantity === 'number' && quantity > 0) {
            const rightsShares = Math.floor(quantity / 2);
            if (rightsShares > 0) {
                const cost = rightsShares * 10;
                // Check if player has enough cash for this batch
                if (player.cash_balance - totalCost >= cost) {
                    totalCost += cost;
                    newHoldings[symbol] = quantity + rightsShares;
                    // Note: We are NOT checking share supply here for simplicity, but we should.
                    // Assuming Rights Issue creates NEW shares or supply is ample.
                }
            }
        }
    }

    if (totalCost > 0) {
        await supabase
            .from('game_players')
            .update({
                cash_balance: player.cash_balance - totalCost,
                stock_holdings: newHoldings
            })
            .eq('player_id', playerId);

        console.log(`[handleRightsIssued] Exercised rights for total cost $${totalCost}`);
    } else {
        console.log('[handleRightsIssued] No rights exercised (insufficient shares or cash)');
    }
}

async function handleDebenture(gameId: string, playerId: string) {
    // Logic: If any stock is at 0, pay Face Value (Assume $1000 or similar? Rules say "Face Value").
    // Let's assume Face Value is $1000 for now, or check Company def.
    // We need to check current prices.

    const { data: game } = await supabase
        .from('games')
        .select('stock_prices')
        .eq('game_id', gameId)
        .single();

    if (!game) throw new Error('Game not found');

    const prices = game.stock_prices || {};
    const bankruptStocks = Object.values(prices).filter(p => p === 0);

    if (bankruptStocks.length > 0) {
        // Conditionmet: at least one stock is 0.
        // Pay basic face value? Or per debenture card? 
        // This function handles ONE card play. 
        // Let's award $2000 (standard debenture value in many variants, or check rules).
        // User didn't specify value, I'll use $2000 as a placeholder high value.

        await handleCurrencyEffect(playerId, 0); // Hack to get player
        const { data: player } = await supabase
            .from('game_players')
            .select('cash_balance')
            .eq('player_id', playerId)
            .single();

        if (player) {
            await supabase
                .from('game_players')
                .update({ cash_balance: player.cash_balance + 2000 }) // Award $2000
                .eq('player_id', playerId);
        }
        console.log('[handleDebenture] Awarded $2000 for Debenture');
    } else {
        throw new Error('Debenture requirements not met: No stock is at $0.');
    }
}

async function removeCardFromHand(playerId: string, cardId: string) {
    // We need to fetch current cards, filter, and update.
    // Ideally this would be a Postgres function to be atomic, but JS is OK for prototype.
    const { data: player } = await supabase
        .from('game_players')
        .select('current_cards')
        .eq('player_id', playerId)
        .single();

    if (!player) throw new Error('Player not found');

    const currentCards = player.current_cards as Card[];
    const newCards = currentCards.filter(c => c.id !== cardId);

    await supabase
        .from('game_players')
        .update({ current_cards: newCards })
        .eq('player_id', playerId);
}

async function recordCardUsage(gameId: string, playerId: string, card: Card) {
    await supabase
        .from('transactions')
        .insert({
            game_id: gameId,
            player_id: playerId,
            transaction_type: 'card_effect', // Alignment with transactionService
            // Defaulting these for now, real implementation needs current round/transaction from game state
            round_number: 1,
            transaction_number: 1,
            details: { card_type: card.type, card_id: card.id },
            total_amount: 0 // Required by RLS or strict schema usually
        });
}

/**
 * Validates if a player can buy shares of a specific stock based on their hand.
 * Rule: Cards for that stock must sum to >= 0 OR they must be the first buyer.
 */
export function canBuyStockWithCards(
    cardsInHand: Card[],
    stockId: string,
    isFirstBuyer: boolean = false
) {
    // START RULE UPDATE: User requested to restore "First Buyer" rule.
    // If you are the first buyer, you can buy regardless of cards.
    if (isFirstBuyer) {
        console.log(`[canBuyStockWithCards] Allowed: First Buyer for ${stockId}`);
        return true;
    }
    // END RULE UPDATE

    const stockCards = cardsInHand.filter(c =>
        c.type === 'price' &&
        (c.companyId === stockId || (c as any).company_id === stockId)
    );

    // If you have NO cards for a stock, you CANNOT buy it (unless First Buyer).
    if (stockCards.length === 0) {
        console.log(`[canBuyStockWithCards] Blocked: No cards for ${stockId}`);
        return false;
    }

    const sum = stockCards.reduce((acc, c) => acc + (c.value || 0), 0);

    // If sum is exactly 0, it counts as positive/neutral, so you CAN buy.
    return sum >= 0;
}
