import { supabase } from './supabase';

// Company starting prices (from company_profiles.md)
export const STARTING_PRICES = {
  atlas_bank: 20,
  titan_steel: 25,
  global_industries: 45,
  omega_energy: 55,
  vitalcare_pharma: 75,
  novatech: 80
};

// Share supply based on variant
export const SHARE_SUPPLY = {
  standard: {
    atlas_bank: 200000,
    titan_steel: 200000,
    global_industries: 200000,
    omega_energy: 200000,
    vitalcare_pharma: 200000,
    novatech: 200000
  },
  extended: {
    atlas_bank: 300000,
    titan_steel: 300000,
    global_industries: 300000,
    omega_energy: 300000,
    vitalcare_pharma: 300000,
    novatech: 300000
  }
};

/**
 * Initialize game state when starting a game
 * Sets up:
 * - Stock prices to starting values
 * - Share supply based on variant
 * - Player cash to starting capital
 * - Started timestamp
 */
export async function initializeGameState(gameId: string) {
  try {
    console.log('[initializeGameState] 🎮 Starting initialization for game:', gameId);
    console.log('[initializeGameState] Current user:', (await supabase.auth.getUser()).data.user?.id);

    // Get game configuration
    console.log('[initializeGameState] Step 1: Fetching game data...');
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (gameError) {
      console.error('[initializeGameState] ❌ Error fetching game:', gameError);
      throw gameError;
    }
    if (!game) {
      console.error('[initializeGameState] ❌ Game not found');
      throw new Error('Game not found');
    }

    console.log('[initializeGameState] ✅ Game found:', game.game_mode, game.game_variant, 'Host:', game.host_user_id);

    // Determine share supply based on variant
    const shareSupply = game.game_variant === 'extended'
      ? SHARE_SUPPLY.extended
      : SHARE_SUPPLY.standard;

    // Update game with starting prices and share supply
    console.log('[initializeGameState] Step 2: Updating game state to in_progress...');
    const { error: updateError } = await supabase
      .from('games')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_round: 1,
        current_transaction: 1,
        dealer_position: 1,
        current_player_position: 1,  // Start with player 1
        stock_prices: STARTING_PRICES,
        share_supply: shareSupply
      })
      .eq('game_id', gameId);

    if (updateError) {
      console.error('[initializeGameState] ❌ Error updating game:', updateError);
      console.error('[initializeGameState] ❌ Update error details:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }
    console.log('[initializeGameState] ✅ Game status updated to in_progress');

    // Initialize player portfolios with starting capital and empty holdings
    console.log('[initializeGameState] Step 3: Fetching players...');
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('player_id, user_id')
      .eq('game_id', gameId);

    if (playersError) {
      console.error('[initializeGameState] ❌ Error fetching players:', playersError);
      throw playersError;
    }

    // Update each player with starting cash and empty stock holdings
    const emptyHoldings = {
      atlas_bank: 0,
      titan_steel: 0,
      global_industries: 0,
      omega_energy: 0,
      vitalcare_pharma: 0,
      novatech: 0
    };

    console.log('[initializeGameState] Step 4: Initializing', players?.length, 'player portfolios...');
    for (const player of players || []) {
      console.log('[initializeGameState] 👤 Updating player:', player.player_id, 'user:', player.user_id);
      const { error: playerUpdateError } = await supabase
        .from('game_players')
        .update({
          cash_balance: game.starting_capital,
          stock_holdings: emptyHoldings
        })
        .eq('player_id', player.player_id);

      if (playerUpdateError) {
        console.error('[initializeGameState] ❌ Error updating player:', player.player_id, playerUpdateError);
        console.error('[initializeGameState] ❌ Player error details:', JSON.stringify(playerUpdateError, null, 2));
        throw new Error(`Failed to update player ${player.player_id}: ${playerUpdateError.message}`);
      }
      console.log('[initializeGameState] ✅ Player updated successfully:', player.player_id);
    }

    console.log('[initializeGameState] ✅ Game initialized successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('[initializeGameState] ❌ FAILED:', error);
    throw error;
  }
}
