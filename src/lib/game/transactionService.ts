/**
 * Transaction Service
 * Handles executing buy, sell, and pass transactions with game state updates
 */

import { supabase } from '../supabase';
import { validatePurchase, validateSale } from './validator';
import { getOwnershipStatus } from './calculator';

export interface TransactionResult {
  success: boolean;
  error?: string;
  cardDrawn?: any;
  newPrice?: number;
  priceChange?: number;
}

/**
 * Execute a buy transaction
 */
export async function executeBuyTransaction(
  gameId: string,
  playerId: string,
  stockSymbol: string,
  quantity: number
): Promise<TransactionResult> {
  try {
    // Fetch current game state and player data
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

    // Get current stock price and share supply
    const stockPrices = game.stock_prices || {};
    const shareSupply = game.share_supply || {};
    const currentPrice = stockPrices[stockSymbol];
    const availableShares = shareSupply[stockSymbol];

    // Validate the purchase
    const totalSharesForStock = game.game_variant === 'extended' ? 300000 : 200000;
    const validation = validatePurchase(
      {
        id: player.player_id,
        cash: player.cash_balance,
        holdings: player.stock_holdings || {}
      },
      {
        name: stockSymbol,
        currentPrice: currentPrice,
        availableShares: availableShares,
        totalShares: totalSharesForStock
      },
      quantity,
      currentPrice
    );

    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    // Check share availability
    if (quantity > availableShares) {
      return { success: false, error: 'Insufficient shares available in the market' };
    }

    const totalCost = currentPrice * quantity;

    // Update player portfolio
    const newCashBalance = player.cash_balance - totalCost;
    const newStockHoldings = { ...player.stock_holdings };
    newStockHoldings[stockSymbol] = (newStockHoldings[stockSymbol] || 0) + quantity;

    // Update share supply
    const newShareSupply = { ...shareSupply };
    newShareSupply[stockSymbol] = availableShares - quantity;

    // Calculate ownership levels
    const totalSharesInGame = game.game_variant === 'extended' ? 300000 : 200000;
    const playerShares = newStockHoldings[stockSymbol];
    const ownershipPercentage = (playerShares / totalSharesInGame) * 100;
    const ownershipLevel = getOwnershipStatus(ownershipPercentage, game.game_variant);

    // Update director/chairman status
    let directorOf = player.director_of || [];
    let chairmanOf = player.chairman_of || [];

    if (ownershipLevel === 'chairman' && !chairmanOf.includes(stockSymbol)) {
      chairmanOf = [...chairmanOf, stockSymbol];
      directorOf = directorOf.filter((s: string) => s !== stockSymbol);
    } else if (ownershipLevel === 'director' && !directorOf.includes(stockSymbol) && !chairmanOf.includes(stockSymbol)) {
      directorOf = [...directorOf, stockSymbol];
    }

    // Update player in database
    const { error: updatePlayerError } = await supabase
      .from('game_players')
      .update({
        cash_balance: newCashBalance,
        stock_holdings: newStockHoldings,
        director_of: directorOf,
        chairman_of: chairmanOf
      })
      .eq('player_id', playerId);

    if (updatePlayerError) {
      return { success: false, error: 'Failed to update player portfolio' };
    }

    // Update game state (share supply)
    const { error: updateGameError } = await supabase
      .from('games')
      .update({
        share_supply: newShareSupply
      })
      .eq('game_id', gameId);

    if (updateGameError) {
      return { success: false, error: 'Failed to update game state' };
    }

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error executing buy transaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute a sell transaction
 */
export async function executeSellTransaction(
  gameId: string,
  playerId: string,
  stockSymbol: string,
  quantity: number
): Promise<TransactionResult> {
  try {
    // Fetch current game state and player data
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

    // Get current stock price and share supply
    const stockPrices = game.stock_prices || {};
    const shareSupply = game.share_supply || {};
    const currentPrice = stockPrices[stockSymbol];

    // Validate the sale
    const totalSharesForValidation = game.game_variant === 'extended' ? 300000 : 200000;
    const validation = validateSale(
      {
        id: player.player_id,
        cash: player.cash_balance,
        holdings: player.stock_holdings || {}
      },
      {
        name: stockSymbol,
        currentPrice: currentPrice,
        availableShares: shareSupply[stockSymbol] || 0,
        totalShares: totalSharesForValidation
      },
      quantity
    );

    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    const totalProceeds = currentPrice * quantity;

    // Update player portfolio
    const newCashBalance = player.cash_balance + totalProceeds;
    const newStockHoldings = { ...player.stock_holdings };
    newStockHoldings[stockSymbol] = (newStockHoldings[stockSymbol] || 0) - quantity;

    // Update share supply
    const newShareSupply = { ...shareSupply };
    newShareSupply[stockSymbol] = (shareSupply[stockSymbol] || 0) + quantity;

    // Calculate ownership levels
    const totalSharesInGame = game.game_variant === 'extended' ? 300000 : 200000;
    const playerShares = newStockHoldings[stockSymbol];
    const ownershipPercentage = (playerShares / totalSharesInGame) * 100;
    const ownershipLevel = getOwnershipStatus(ownershipPercentage, game.game_variant);

    // Update director/chairman status
    let directorOf = player.director_of || [];
    let chairmanOf = player.chairman_of || [];

    if (ownershipLevel === 'none') {
      directorOf = directorOf.filter((s: string) => s !== stockSymbol);
      chairmanOf = chairmanOf.filter((s: string) => s !== stockSymbol);
    } else if (ownershipLevel === 'director') {
      chairmanOf = chairmanOf.filter((s: string) => s !== stockSymbol);
      if (!directorOf.includes(stockSymbol)) {
        directorOf = [...directorOf, stockSymbol];
      }
    }

    // Update player in database
    const { error: updatePlayerError } = await supabase
      .from('game_players')
      .update({
        cash_balance: newCashBalance,
        stock_holdings: newStockHoldings,
        director_of: directorOf,
        chairman_of: chairmanOf
      })
      .eq('player_id', playerId);

    if (updatePlayerError) {
      return { success: false, error: 'Failed to update player portfolio' };
    }

    // Update game state (share supply)
    const { error: updateGameError } = await supabase
      .from('games')
      .update({
        share_supply: newShareSupply
      })
      .eq('game_id', gameId);

    if (updateGameError) {
      return { success: false, error: 'Failed to update game state' };
    }

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error executing sell transaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute a pass transaction
 */
export async function executePassTransaction(): Promise<TransactionResult> {
  try {
    // Simply advance to next transaction/round
    // The actual turn advancement logic will be handled separately
    return { success: true };
  } catch (error: any) {
    console.error('Error executing pass transaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Advance to the next transaction/round
 */
export async function advanceTransaction(gameId: string): Promise<boolean> {
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

    const currentTransaction = game.current_transaction || 1;
    const currentRound = game.current_round || 1;
    const totalRounds = game.rounds_total || 10;

    // Each round has 3 transactions
    if (currentTransaction < 3) {
      // Advance to next transaction
      const { error: updateError } = await supabase
        .from('games')
        .update({
          current_transaction: currentTransaction + 1
        })
        .eq('game_id', gameId);

      return !updateError;
    } else {
      // Advance to next round
      if (currentRound < totalRounds) {
        const { error: updateError } = await supabase
          .from('games')
          .update({
            current_round: currentRound + 1,
            current_transaction: 1
          })
          .eq('game_id', gameId);

        return !updateError;
      } else {
        // Game over
        const { error: updateError } = await supabase
          .from('games')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('game_id', gameId);

        return !updateError;
      }
    }
  } catch (error: any) {
    console.error('Error advancing transaction:', error);
    return false;
  }
}
