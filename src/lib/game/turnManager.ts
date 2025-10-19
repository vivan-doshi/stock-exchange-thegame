/**
 * Turn Manager
 * Manages player turn order and validates whose turn it is
 */

import { supabase } from '../supabase';

export interface TurnInfo {
  currentPlayerId: string;
  currentPlayerPosition: number;
  currentPlayerName: string;
  nextPlayerId: string;
  nextPlayerPosition: number;
  isYourTurn: boolean;
}

/**
 * Get information about whose turn it currently is
 */
export async function getCurrentTurnInfo(gameId: string, userId: string): Promise<TurnInfo | null> {
  try {
    // Get game data - use current_player_position (not dealer_position)
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('current_player_position')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      console.error('Error fetching game:', gameError);
      return null;
    }

    // Get all players in order with their profile data
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('player_id, user_id, player_position')
      .eq('game_id', gameId)
      .order('player_position', { ascending: true });

    if (playersError || !players || players.length === 0) {
      console.error('Error fetching players:', playersError);
      return null;
    }

    // Get profile data for all players
    const playerIds = players.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from('game_profiles')
      .select('user_id, display_name, username')
      .in('user_id', playerIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Determine current player based on current_player_position
    const currentPlayerPosition = game.current_player_position || 1;
    const currentPlayer = players.find(p => p.player_position === currentPlayerPosition);

    if (!currentPlayer) {
      console.error('Could not find current player. Current player position:', currentPlayerPosition, 'Players:', players);
      return null;
    }

    // Calculate next player position
    const nextPosition = (currentPlayerPosition % players.length) + 1;
    const nextPlayer = players.find(p => p.player_position === nextPosition);

    if (!nextPlayer) {
      console.error('Could not find next player');
      return null;
    }

    // Check if it's the current user's turn
    const isYourTurn = currentPlayer.user_id === userId;

    const currentProfile = profileMap.get(currentPlayer.user_id);

    return {
      currentPlayerId: currentPlayer.player_id,
      currentPlayerPosition: currentPlayer.player_position,
      currentPlayerName: currentProfile?.username || currentProfile?.display_name || 'Player',
      nextPlayerId: nextPlayer.player_id,
      nextPlayerPosition: nextPlayer.player_position,
      isYourTurn
    };
  } catch (error) {
    console.error('Error getting turn info:', error);
    return null;
  }
}

/**
 * Validate that it's the specified player's turn
 */
export async function validatePlayerTurn(gameId: string, playerId: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    // Get game data - use current_player_position
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('current_player_position')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      return { valid: false, reason: 'Game not found' };
    }

    // Get player data
    const { data: player, error: playerError } = await supabase
      .from('game_players')
      .select('player_position, user_id')
      .eq('player_id', playerId)
      .single();

    if (playerError || !player) {
      return { valid: false, reason: 'Player not found' };
    }

    // Check if it's this player's turn
    const currentPlayerPosition = game.current_player_position || 1;
    if (player.player_position !== currentPlayerPosition) {
      return { valid: false, reason: 'It is not your turn' };
    }

    return { valid: true };
  } catch (error: any) {
    console.error('Error validating turn:', error);
    return { valid: false, reason: error.message };
  }
}

/**
 * Advance to the next player's turn (within current transaction)
 * Does NOT change dealer_position (dealer stays same for entire round)
 */
export async function advanceToNextPlayer(gameId: string): Promise<boolean> {
  try {
    console.log('[advanceToNextPlayer] Starting for game:', gameId);

    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('current_player_position, dealer_position')
      .eq('game_id', gameId)
      .single();

    if (gameError || !game) {
      console.error('[advanceToNextPlayer] Failed to fetch game state:', gameError);
      return false;
    }

    console.log('[advanceToNextPlayer] Fetched game data:', game);
    console.log('[advanceToNextPlayer] current_player_position value:', game.current_player_position);
    console.log('[advanceToNextPlayer] dealer_position value:', game.dealer_position);

    // Get all players to determine total count
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('player_id, player_position, user_id')
      .eq('game_id', gameId)
      .order('player_position', { ascending: true });

    if (playersError || !players || players.length === 0) {
      console.error('[advanceToNextPlayer] Failed to fetch players:', playersError);
      return false;
    }

    const currentPlayerPosition = game.current_player_position || 1;
    const playerCount = players.length;

    // Calculate next player position (rotates through all players)
    const nextPlayerPosition = (currentPlayerPosition % playerCount) + 1;

    console.log('[advanceToNextPlayer] Player positions:', players.map(p => `Position ${p.player_position}: ${p.user_id.substring(0, 8)}...`));
    console.log('[advanceToNextPlayer] Current player position:', currentPlayerPosition, '→ Next position:', nextPlayerPosition, 'Total players:', playerCount);

    // Update current_player_position (NOT dealer_position)
    const { error: updateError } = await supabase
      .from('games')
      .update({ current_player_position: nextPlayerPosition })
      .eq('game_id', gameId);

    if (updateError) {
      console.error('[advanceToNextPlayer] Error updating player position:', updateError);
      return false;
    }

    console.log('[advanceToNextPlayer] Successfully updated current_player_position to', nextPlayerPosition);

    return true;
  } catch (error: any) {
    console.error('[advanceToNextPlayer] Error:', error);
    return false;
  }
}

/**
 * Get all players in turn order
 */
export async function getPlayersInTurnOrder(gameId: string): Promise<Array<{
  playerId: string;
  userId: string;
  position: number;
  name: string;
  isActive: boolean;
}> | null> {
  try {
    const { data: game } = await supabase
      .from('games')
      .select('current_player_position')
      .eq('game_id', gameId)
      .single();

    const { data: players, error } = await supabase
      .from('game_players')
      .select('player_id, user_id, player_position')
      .eq('game_id', gameId)
      .order('player_position', { ascending: true });

    if (error || !players) {
      console.error('Error fetching players:', error);
      return null;
    }

    // Get profile data for all players
    const playerIds = players.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from('game_profiles')
      .select('user_id, display_name, username')
      .in('user_id', playerIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const currentPlayerPosition = game?.current_player_position || 1;

    return players.map(p => {
      const profile = profileMap.get(p.user_id);
      return {
        playerId: p.player_id,
        userId: p.user_id,
        position: p.player_position,
        name: profile?.username || profile?.display_name || `Player ${p.player_position}`,
        isActive: p.player_position === currentPlayerPosition
      };
    });
  } catch (error) {
    console.error('Error getting players in turn order:', error);
    return null;
  }
}
