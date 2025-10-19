/**
 * Transaction Service
 * Handles executing buy, sell, and pass transactions with game state updates
 */

import { supabase } from '../supabase';
import { validatePurchase, validateSale } from './validator';
import { getOwnershipStatus } from './calculator';
import { advanceToNextPlayer, validatePlayerTurn } from './turnManager';

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
    // Validate that it's this player's turn
    const turnValidation = await validatePlayerTurn(gameId, playerId);
    if (!turnValidation.valid) {
      return { success: false, error: turnValidation.reason || 'It is not your turn' };
    }

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

    // Log the transaction
    console.log('[executeBuyTransaction] Logging transaction:', {
      game_id: gameId,
      player_id: playerId,
      round_number: game.current_round,
      transaction_number: game.current_transaction,
      transaction_type: 'buy_shares',
      stock_symbol: stockSymbol,
      quantity: quantity,
      price_per_share: currentPrice,
      total_amount: -totalCost
    });

    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        game_id: gameId,
        player_id: playerId,
        round_number: game.current_round,
        transaction_number: game.current_transaction,
        transaction_type: 'buy_shares',
        stock_symbol: stockSymbol,
        quantity: quantity,
        price_per_share: currentPrice,
        total_amount: -totalCost,
        cash_before: player.cash_balance,
        cash_after: newCashBalance
      })
      .select();

    if (txError) {
      console.error('[executeBuyTransaction] Failed to log transaction:', txError);
    } else {
      console.log('[executeBuyTransaction] Transaction logged successfully:', txData);
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
    // Validate that it's this player's turn
    const turnValidation = await validatePlayerTurn(gameId, playerId);
    if (!turnValidation.valid) {
      return { success: false, error: turnValidation.reason || 'It is not your turn' };
    }

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

    // Log the transaction
    console.log('[executeSellTransaction] Logging transaction:', {
      game_id: gameId,
      player_id: playerId,
      round_number: game.current_round,
      transaction_number: game.current_transaction,
      transaction_type: 'sell_shares',
      stock_symbol: stockSymbol,
      quantity: quantity,
      price_per_share: currentPrice,
      total_amount: totalProceeds
    });

    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        game_id: gameId,
        player_id: playerId,
        round_number: game.current_round,
        transaction_number: game.current_transaction,
        transaction_type: 'sell_shares',
        stock_symbol: stockSymbol,
        quantity: quantity,
        price_per_share: currentPrice,
        total_amount: totalProceeds,
        cash_before: player.cash_balance,
        cash_after: newCashBalance
      })
      .select();

    if (txError) {
      console.error('[executeSellTransaction] Failed to log transaction:', txError);
    } else {
      console.log('[executeSellTransaction] Transaction logged successfully:', txData);
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
export async function executePassTransaction(
  gameId: string,
  playerId: string
): Promise<TransactionResult> {
  try {
    // Validate that it's this player's turn
    const turnValidation = await validatePlayerTurn(gameId, playerId);
    if (!turnValidation.valid) {
      return { success: false, error: turnValidation.reason || 'It is not your turn' };
    }

    // Get game and player data for logging
    const { data: game } = await supabase
      .from('games')
      .select('current_round, current_transaction')
      .eq('game_id', gameId)
      .single();

    const { data: player } = await supabase
      .from('game_players')
      .select('cash_balance')
      .eq('player_id', playerId)
      .single();

    if (!game || !player) {
      return { success: false, error: 'Failed to fetch game or player data' };
    }

    // Log the pass transaction
    console.log('[executePassTransaction] Logging transaction:', {
      game_id: gameId,
      player_id: playerId,
      round_number: game.current_round,
      transaction_number: game.current_transaction,
      transaction_type: 'card_effect'
    });

    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        game_id: gameId,
        player_id: playerId,
        round_number: game.current_round,
        transaction_number: game.current_transaction,
        transaction_type: 'card_effect',
        stock_symbol: null,
        quantity: null,
        price_per_share: null,
        total_amount: 0,
        cash_before: player.cash_balance,
        cash_after: player.cash_balance
      })
      .select();

    if (txError) {
      console.error('[executePassTransaction] Failed to log pass transaction:', txError);
    } else {
      console.log('[executePassTransaction] Transaction logged successfully:', txData);
    }

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
    console.log('[advanceTransaction] Starting for game:', gameId);

    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      console.error('[advanceTransaction] Failed to fetch game state:', gameError);
      return false;
    }

    // Get total number of players
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('player_id, player_position')
      .eq('game_id', gameId);

    if (playersError || !players || players.length === 0) {
      console.error('[advanceTransaction] Failed to fetch players:', playersError);
      return false;
    }

    const playerCount = players.length;
    const currentDealerPosition = game.dealer_position || 1;
    const currentTransaction = game.current_transaction || 1;
    const currentRound = game.current_round || 1;
    const totalRounds = game.rounds_total || 10;

    console.log('[advanceTransaction] Current state - Round:', currentRound, 'Transaction:', currentTransaction, 'Players:', playerCount);

    // Advance to next player's turn
    const turnAdvanced = await advanceToNextPlayer(gameId);
    console.log('[advanceTransaction] Turn advanced:', turnAdvanced);

    if (!turnAdvanced) {
      console.error('[advanceTransaction] CRITICAL: advanceToNextPlayer failed!');
      return false;
    }

    // IMPORTANT: Wait for database to commit the update
    // Supabase may have a slight delay before the update is visible
    console.log('[advanceTransaction] Waiting for database commit...');
    await new Promise(resolve => setTimeout(resolve, 100));

    // IMPORTANT: Refetch game state to get the UPDATED current_player_position
    console.log('[advanceTransaction] Refetching game state to verify turn advancement...');
    const { data: updatedGame, error: refetchError } = await supabase
      .from('games')
      .select('current_player_position, dealer_position')
      .eq('game_id', gameId)
      .single();

    if (refetchError || !updatedGame) {
      console.error('[advanceTransaction] Failed to refetch game state:', refetchError);
      return false;
    }

    const nextPlayerPosition = updatedGame.current_player_position || 1;
    const currentDealerPos = updatedGame.dealer_position || 1;
    console.log('[advanceTransaction] After turn advance - New player position:', nextPlayerPosition);
    console.log('[advanceTransaction] Dealer position:', currentDealerPos);

    // Check if we've cycled back to the first player of this transaction
    // First player is always the one AFTER the dealer
    const firstPlayerOfTransaction = (currentDealerPos % playerCount) + 1;
    console.log('[advanceTransaction] First player of transaction:', firstPlayerOfTransaction);

    if (nextPlayerPosition === firstPlayerOfTransaction) {
      console.log('[advanceTransaction] All players completed transaction', currentTransaction, '- advancing to next transaction/round');

      // All players have completed this transaction, advance to next transaction or round
      if (currentTransaction < 3) {
        // Advance to next transaction
        // Reset current_player_position to first player (person after dealer)
        console.log('[advanceTransaction] Resetting turn to first player:', firstPlayerOfTransaction);

        const { error: updateError } = await supabase
          .from('games')
          .update({
            current_transaction: currentTransaction + 1,
            current_player_position: firstPlayerOfTransaction  // Reset to first player of new transaction
          })
          .eq('game_id', gameId);

        if (updateError) {
          console.error('[advanceTransaction] Failed to update transaction number:', updateError);
          return false;
        }

        console.log('[advanceTransaction] Advanced to transaction', currentTransaction + 1, '- Turn reset to player', firstPlayerOfTransaction);
        return true;
      } else {
        // All 3 transactions completed, advance to next round
        if (currentRound < totalRounds) {
          // Get current dealer position to rotate it
          const { data: gameWithDealer } = await supabase
            .from('games')
            .select('dealer_position')
            .eq('game_id', gameId)
            .single();

          const currentDealerPosition = gameWithDealer?.dealer_position || 1;
          const nextDealerPosition = (currentDealerPosition % playerCount) + 1;
          // First player of new round is the one AFTER the new dealer
          const firstPlayerOfRound = (nextDealerPosition % playerCount) + 1;

          console.log('[advanceTransaction] Round complete! Rotating dealer:', currentDealerPosition, '→', nextDealerPosition);
          console.log('[advanceTransaction] First player of new round:', firstPlayerOfRound);

          const { error: updateError } = await supabase
            .from('games')
            .update({
              current_round: currentRound + 1,
              current_transaction: 1,
              dealer_position: nextDealerPosition,
              current_player_position: firstPlayerOfRound  // Player AFTER dealer starts the round
            })
            .eq('game_id', gameId);

          if (updateError) {
            console.error('[advanceTransaction] Failed to advance round:', updateError);
            return false;
          }

          console.log('[advanceTransaction] Advanced to round', currentRound + 1, 'with dealer at position', nextDealerPosition);
          return true;
        } else {
          // Game over
          const { error: updateError } = await supabase
            .from('games')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('game_id', gameId);

          console.log('[advanceTransaction] Game completed');
          return !updateError;
        }
      }
    } else {
      console.log('[advanceTransaction] Same transaction continues - next player is', nextDealerPosition);
      // Still cycling through players for current transaction, no need to update transaction number
      return true;
    }
  } catch (error: any) {
    console.error('Error advancing transaction:', error);
    return false;
  }
}
