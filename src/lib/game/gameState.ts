/**
 * Game State Manager
 * Handles game initialization, transaction execution, turn management, and game flow
 */

import { supabase } from '../supabase';
import { generateDeck, shuffleDeck, drawCards, type Card } from './deck';
import { executeBuyTransaction, executeSellTransaction } from './transactionService';
import { calculateNetWorth } from './calculator';
import { validatePlayerTurn } from './turnManager';
import type { GameVariant, GameMode } from '../../types';

// Stock symbols in the game
const STOCK_SYMBOLS = [
  'atlas_bank',
  'titan_steel',
  'global_industries',
  'omega_energy',
  'vitalcare_pharma',
  'novatech'
] as const;

type StockSymbol = typeof STOCK_SYMBOLS[number];

// Starting stock prices (in rupees) - from game rules
const STARTING_PRICES: Record<StockSymbol, number> = {
  atlas_bank: 20,
  titan_steel: 25,
  global_industries: 45,
  omega_energy: 55,
  vitalcare_pharma: 75,
  novatech: 80
};

export interface InitializeGameParams {
  gameId: string;
  players: Array<{ userId: string; position: number }>;
  mode: GameMode;
  variant: GameVariant;
}

export interface TransactionAction {
  type: 'buy' | 'sell' | 'pass';
  stockSymbol?: string;
  quantity?: number;
}

export interface GameStateUpdate {
  success: boolean;
  error?: string;
  gameState?: any;
  cardsDrawn?: Card[];
  newPrice?: number;
  priceChange?: number;
}

/**
 * Initialize a new game with starting conditions
 *
 * Sets up:
 * - Starting prices for all stocks
 * - Starting capital for each player ($600k or $450k)
 * - Shuffled deck
 * - Round 1, transaction 1
 * - Saves everything to database
 */
export async function initializeGame(params: InitializeGameParams): Promise<{ success: boolean; error?: string }> {
  const { gameId, players, mode, variant } = params;

  try {
    // Determine starting capital based on variant
    const startingCapital = variant === 'standard' ? 600000 : 450000;
    const maxShares = variant === 'standard' ? 200000 : 300000;

    // Generate and shuffle the deck
    const deck = generateDeck(variant);
    const shuffledDeck = shuffleDeck(deck);

    // Initialize stock prices
    const stockPrices: Record<string, number> = {};
    const shareSupply: Record<string, number> = {};

    STOCK_SYMBOLS.forEach((symbol) => {
      stockPrices[symbol] = STARTING_PRICES[symbol];
      shareSupply[symbol] = maxShares;
    });

    // Update game record with initial state
    const { error: gameError } = await supabase
      .from('games')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_round: 1,
        current_transaction: 1,
        stock_prices: stockPrices,
        share_supply: shareSupply,
        dealer_position: 1
      })
      .eq('game_id', gameId);

    if (gameError) {
      console.error('Error initializing game:', gameError);
      return { success: false, error: 'Failed to initialize game state' };
    }

    // Initialize each player with starting capital
    for (const player of players) {
      const { error: playerError } = await supabase
        .from('game_players')
        .update({
          cash_balance: startingCapital,
          stock_holdings: {
            atlas_bank: 0,
            titan_steel: 0,
            global_industries: 0,
            omega_energy: 0,
            vitalcare_pharma: 0,
            novatech: 0
          },
          director_of: [],
          chairman_of: [],
          current_cards: []
        })
        .eq('game_id', gameId)
        .eq('player_position', player.position);

      if (playerError) {
        console.error('Error initializing player:', playerError);
        return { success: false, error: `Failed to initialize player at position ${player.position}` };
      }
    }

    // Store the shuffled deck in a separate table or as JSONB
    // For now, we'll store it in the game record
    // Note: You might want to create a separate deck_state table for better data modeling
    const { error: deckError } = await supabase
      .from('games')
      .update({
        // Store deck as JSONB for now - you may want a separate table
        // This is a simplified approach
      })
      .eq('game_id', gameId);

    // Broadcast game start via Realtime
    await broadcastGameState(gameId, 'game_started');

    return { success: true };
  } catch (error: any) {
    console.error('Error in initializeGame:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute a player transaction (buy, sell, or pass)
 *
 * For buy:
 * - Draw 3 cards for the stock being purchased
 * - Validate purchase conditions
 * - Deduct money from player
 * - Add shares to player portfolio
 * - Calculate new price based on cards
 * - Update ownership status (director/chairman)
 * - Save transaction to database
 * - Broadcast state change
 *
 * For sell:
 * - Remove shares from player
 * - Add money to player
 * - Update ownership status
 * - Save transaction
 * - Broadcast state change
 *
 * For pass:
 * - Just move to next player
 * - Broadcast state change
 */
export async function executeTransaction(
  gameId: string,
  playerId: string,
  action: TransactionAction
): Promise<GameStateUpdate> {
  try {
    // IMPORTANT: Validate that it's this player's turn
    const turnValidation = await validatePlayerTurn(gameId, playerId);
    if (!turnValidation.valid) {
      return { success: false, error: turnValidation.reason || 'It is not your turn' };
    }

    // Fetch current game state
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      return { success: false, error: 'Failed to fetch game state' };
    }

    const { data: player, error: playerError } = await supabase
      .from('game_players')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (playerError || !player) {
      return { success: false, error: 'Failed to fetch player data' };
    }

    let result: GameStateUpdate = { success: false };

    switch (action.type) {
      case 'buy':
        if (!action.stockSymbol || !action.quantity) {
          return { success: false, error: 'Stock symbol and quantity required for buy action' };
        }

        // Execute buy transaction
        const buyResult = await executeBuyTransaction(
          gameId,
          playerId,
          action.stockSymbol,
          action.quantity
        );

        if (!buyResult.success) {
          return { success: false, error: buyResult.error };
        }

        // Draw 3 cards for price change
        // TODO: Implement card drawing from deck stored in game state
        // For now, we'll simulate card drawing
        const cardsDrawn = await drawCardsForStock(gameId, action.stockSymbol, 3);

        // Calculate new price based on cards
        const currentPrice = game.stock_prices[action.stockSymbol];
        const priceChange = cardsDrawn.reduce((sum, card) => sum + (card.value || 0), 0);
        const newPrice = Math.max(0, currentPrice + priceChange);

        // Update stock price in database
        const updatedPrices = { ...game.stock_prices, [action.stockSymbol]: newPrice };
        await supabase
          .from('games')
          .update({ stock_prices: updatedPrices })
          .eq('game_id', gameId);

        // Log transaction
        await logTransaction(
          gameId,
          playerId,
          game.current_round,
          game.current_transaction,
          'buy_shares',
          action.stockSymbol,
          action.quantity,
          currentPrice,
          player.cash_balance,
          cardsDrawn
        );

        result = {
          success: true,
          cardsDrawn,
          newPrice,
          priceChange
        };
        break;

      case 'sell':
        if (!action.stockSymbol || !action.quantity) {
          return { success: false, error: 'Stock symbol and quantity required for sell action' };
        }

        // Execute sell transaction
        const sellResult = await executeSellTransaction(
          gameId,
          playerId,
          action.stockSymbol,
          action.quantity
        );

        if (!sellResult.success) {
          return { success: false, error: sellResult.error };
        }

        // Log transaction
        await logTransaction(
          gameId,
          playerId,
          game.current_round,
          game.current_transaction,
          'sell_shares',
          action.stockSymbol,
          action.quantity,
          game.stock_prices[action.stockSymbol],
          player.cash_balance,
          []
        );

        result = { success: true };
        break;

      case 'pass':
        // Just log the pass action
        await logTransaction(
          gameId,
          playerId,
          game.current_round,
          game.current_transaction,
          'card_effect', // Using card_effect as placeholder for pass
          null,
          0,
          0,
          player.cash_balance,
          []
        );

        result = { success: true };
        break;

      default:
        return { success: false, error: 'Invalid action type' };
    }

    // Advance to next player
    await advanceToNextPlayer(gameId);

    // Broadcast state change via Realtime
    await broadcastGameState(gameId, 'transaction_completed', {
      playerId,
      action,
      result
    });

    return result;
  } catch (error: any) {
    console.error('Error executing transaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Advance to the next player in turn order
 *
 * Logic:
 * - Move to next player
 * - If all players have gone, advance transaction number
 * - If 3 transactions completed, advance round
 * - If 10 rounds completed, end game
 */
export async function advanceToNextPlayer(gameId: string): Promise<boolean> {
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      console.error('Failed to fetch game state');
      return false;
    }

    // Get all players in the game
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId)
      .order('player_position', { ascending: true });

    if (playersError || !players || players.length === 0) {
      console.error('Failed to fetch players');
      return false;
    }

    const currentTransaction = game.current_transaction || 1;
    const currentRound = game.current_round || 1;
    const totalRounds = game.rounds_total || 10;
    const dealerPosition = game.dealer_position || 1;

    // Calculate next dealer position (rotates through players)
    const nextDealerPosition = (dealerPosition % players.length) + 1;

    // Check if all players have completed this transaction
    // For simplicity, we'll assume each transaction involves all players once
    // In actual implementation, you'd track which players have acted

    // Each round has 3 transactions
    if (currentTransaction < 3) {
      // Advance to next transaction in same round
      const { error: updateError } = await supabase
        .from('games')
        .update({
          current_transaction: currentTransaction + 1,
          dealer_position: nextDealerPosition
        })
        .eq('game_id', gameId);

      if (updateError) {
        console.error('Error advancing transaction:', updateError);
        return false;
      }

      await broadcastGameState(gameId, 'transaction_advanced');
      return true;
    } else {
      // Transaction 3 complete, check if we should advance round
      if (currentRound < totalRounds) {
        // Advance to next round
        await endRound(gameId);

        const { error: updateError } = await supabase
          .from('games')
          .update({
            current_round: currentRound + 1,
            current_transaction: 1,
            dealer_position: 1
          })
          .eq('game_id', gameId);

        if (updateError) {
          console.error('Error advancing round:', updateError);
          return false;
        }

        await broadcastGameState(gameId, 'round_advanced');
        return true;
      } else {
        // All rounds complete, end game
        await endGame(gameId);
        return true;
      }
    }
  } catch (error: any) {
    console.error('Error advancing to next player:', error);
    return false;
  }
}

/**
 * End the current round and prepare for the next
 *
 * Actions:
 * - Process any special cards that activate at end of round
 * - Deal new cards for next round (if applicable)
 * - Calculate interim standings
 * - Update database
 * - Broadcast round end
 */
export async function endRound(gameId: string): Promise<boolean> {
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      console.error('Failed to fetch game state');
      return false;
    }

    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    if (playersError || !players) {
      console.error('Failed to fetch players');
      return false;
    }

    // Process special cards (if any need end-of-round processing)
    // TODO: Implement special card processing based on game rules

    // Update net worth for all players
    for (const player of players) {
      const netWorth = calculateNetWorth(
        player.cash_balance,
        player.stock_holdings || {},
        game.stock_prices || {}
      );

      await supabase
        .from('game_players')
        .update({ net_worth: netWorth })
        .eq('player_id', player.player_id);
    }

    // Broadcast round end
    await broadcastGameState(gameId, 'round_ended', {
      round: game.current_round
    });

    return true;
  } catch (error: any) {
    console.error('Error ending round:', error);
    return false;
  }
}

/**
 * End the game and determine winner
 *
 * Actions:
 * - Calculate final net worth for all players
 * - Rank players by net worth
 * - Determine winner
 * - Update player statistics
 * - Mark game as completed
 * - Broadcast game end
 */
export async function endGame(gameId: string): Promise<boolean> {
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      console.error('Failed to fetch game state');
      return false;
    }

    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    if (playersError || !players || players.length === 0) {
      console.error('Failed to fetch players');
      return false;
    }

    // Calculate final net worth for each player
    interface PlayerWithNetWorth {
      player_id: string;
      user_id: string;
      net_worth: number;
    }

    const playersWithNetWorth: PlayerWithNetWorth[] = players.map((player) => {
      const netWorth = calculateNetWorth(
        player.cash_balance,
        player.stock_holdings || {},
        game.stock_prices || {}
      );

      return {
        player_id: player.player_id,
        user_id: player.user_id,
        net_worth: netWorth
      };
    });

    // Sort by net worth (descending)
    playersWithNetWorth.sort((a, b) => b.net_worth - a.net_worth);

    // Assign ranks and update player records
    for (let i = 0; i < playersWithNetWorth.length; i++) {
      const player = playersWithNetWorth[i];
      const rank = i + 1;

      await supabase
        .from('game_players')
        .update({
          final_rank: rank,
          final_net_worth: player.net_worth,
          net_worth: player.net_worth
        })
        .eq('player_id', player.player_id);
    }

    // Determine winner (rank 1)
    const winner = playersWithNetWorth[0];

    // Update game record
    const { error: updateError } = await supabase
      .from('games')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        winner_user_id: winner.user_id
      })
      .eq('game_id', gameId);

    if (updateError) {
      console.error('Error updating game status:', updateError);
      return false;
    }

    // Update player statistics
    // TODO: Update wins, games played, etc. in users table

    // Broadcast game end
    await broadcastGameState(gameId, 'game_ended', {
      winner: winner.user_id,
      finalStandings: playersWithNetWorth
    });

    return true;
  } catch (error: any) {
    console.error('Error ending game:', error);
    return false;
  }
}

/**
 * Helper function to broadcast game state changes via Supabase Realtime
 */
async function broadcastGameState(
  gameId: string,
  eventType: string,
  payload: any = {}
): Promise<void> {
  try {
    // Use Supabase Realtime to broadcast to the game channel
    const channel = supabase.channel(`game:${gameId}`);

    await channel.send({
      type: 'broadcast',
      event: eventType,
      payload: {
        gameId,
        timestamp: new Date().toISOString(),
        ...payload
      }
    });
  } catch (error) {
    console.error('Error broadcasting game state:', error);
  }
}

/**
 * Helper function to draw cards for a stock purchase
 * This would draw from the deck stored in game state
 */
async function drawCardsForStock(
  gameId: string,
  stockSymbol: string,
  count: number
): Promise<Card[]> {
  // TODO: Implement actual card drawing from deck stored in database
  // For now, return mock cards
  // In production, you'd:
  // 1. Fetch the deck from database
  // 2. Draw cards using drawCards() function
  // 3. Update the deck in database
  // 4. Return the drawn cards

  // Mock implementation - generates random price changes
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const values = [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30];
    const randomValue = values[Math.floor(Math.random() * values.length)];

    cards.push({
      id: `card-${Date.now()}-${i}`,
      type: 'price',
      stock: stockSymbol,
      value: randomValue
    });
  }

  return cards;
}

/**
 * Helper function to log a transaction to the database
 */
async function logTransaction(
  gameId: string,
  playerId: string,
  roundNumber: number,
  transactionNumber: number,
  transactionType: string,
  stockSymbol: string | null,
  quantity: number,
  pricePerShare: number,
  cashBefore: number,
  cardsDrawn: Card[]
): Promise<void> {
  try {
    const totalAmount = quantity * pricePerShare;

    await supabase.from('transactions').insert({
      game_id: gameId,
      player_id: playerId,
      round_number: roundNumber,
      transaction_number: transactionNumber,
      transaction_type: transactionType,
      stock_symbol: stockSymbol,
      quantity: quantity > 0 ? quantity : null,
      price_per_share: pricePerShare > 0 ? pricePerShare : null,
      total_amount: totalAmount,
      cash_before: cashBefore,
      cash_after: cashBefore - totalAmount,
      details: {
        cards_drawn: cardsDrawn
      }
    });
  } catch (error) {
    console.error('Error logging transaction:', error);
  }
}
