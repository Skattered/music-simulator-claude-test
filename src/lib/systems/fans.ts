/**
 * Music Industry Simulator - Fan System
 *
 * Handles fan generation and growth.
 *
 * Fan Mechanics:
 * - Fans grow passively from completed songs
 * - More songs = more fan generation
 * - Tech tier affects fan generation rate
 * - Active boosts can temporarily increase fan growth
 * - Peak fans tracked for prestige bonuses
 *
 * Fan generation scales with:
 * 1. Total completed songs (more catalog = more discovery)
 * 2. Tech tier multiplier (better tech = better reach)
 * 3. Experience multiplier (from prestiges)
 * 4. Active boost multipliers (exploitation abilities)
 */

import type { GameState } from '$lib/game/types';
import { getTechTier } from '$lib/game/config';

/**
 * Base fan generation rate per song per second
 * This is tuned during playtesting
 */
const BASE_FAN_RATE = 0.01; // 0.01 fans per song per second

/**
 * Generates fans for the current tick
 *
 * Fans grow based on total completed songs, tech tier, and multipliers.
 * Updates peak fans if current fans exceeds previous peak.
 *
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last tick (in seconds)
 *
 * @example
 * ```typescript
 * // Called every tick from game engine
 * generateFans(state, 0.1); // 100ms tick
 * ```
 */
export function generateFans(state: GameState, deltaTime: number): void {
	const fansPerSecond = calculateFanGeneration(state);

	// Fans generated this tick
	const fansThisTick = fansPerSecond * deltaTime;

	state.currentArtist.fans += fansThisTick;

	// Update peak fans for prestige calculation
	updatePeakFans(state);
}

/**
 * Calculates fan generation rate per second
 *
 * Formula: total_completed_songs * BASE_FAN_RATE * tech_multiplier * experience_multiplier * boost_multipliers
 *
 * Fan generation scales with:
 * - Number of completed songs (more catalog = more discovery)
 * - Tech tier multiplier (better distribution)
 * - Experience multiplier (from prestiges)
 * - Active boost multipliers
 *
 * @param state - Current game state
 * @returns Fans generated per second
 */
export function calculateFanGeneration(state: GameState): number {
	if (state.totalCompletedSongs === 0) {
		return 0; // No songs = no fans
	}

	const techTier = getTechTier(state.currentTechTier);

	// Base fan generation from song catalog
	const baseFans = state.totalCompletedSongs * BASE_FAN_RATE;

	// Apply tech tier multiplier (better tech = better reach)
	const techMultiplier = techTier.fanMultiplier;

	// Apply experience multiplier from prestiges
	const experienceMultiplier = state.experienceMultiplier;

	// Calculate base rate with multipliers
	let fansPerSecond = baseFans * techMultiplier * experienceMultiplier;

	// Apply active fan boost multipliers
	fansPerSecond = applyFanBoosts(state, fansPerSecond);

	return fansPerSecond;
}

/**
 * Applies active fan boost multipliers from exploitation abilities
 *
 * Exploitation abilities like "Pay for Playlist Placement" can
 * temporarily boost fan generation.
 *
 * @param state - Current game state
 * @param baseFans - Fan generation before boosts
 * @returns Fan generation after all active boosts
 */
export function applyFanBoosts(state: GameState, baseFans: number): number {
	let multipliedFans = baseFans;

	const now = Date.now();

	// Apply all active fan boosts
	for (const boost of state.activeBoosts) {
		// Check if boost is still active
		if (boost.type === 'fans' && now < boost.expiresAt) {
			multipliedFans *= boost.multiplier;
		}
	}

	return multipliedFans;
}

/**
 * Updates peak fans if current exceeds previous peak
 *
 * Peak fans are used for prestige bonus calculations.
 * This ensures we track the maximum fans achieved even after prestige.
 *
 * @param state - Current game state
 */
export function updatePeakFans(state: GameState): void {
	if (state.currentArtist.fans > state.currentArtist.peakFans) {
		state.currentArtist.peakFans = state.currentArtist.fans;
	}
}

/**
 * Calculates fan growth rate (fans per second)
 *
 * Useful for displaying to player.
 *
 * @param state - Current game state
 * @returns Current fan generation rate per second
 */
export function getFanGrowthRate(state: GameState): number {
	return calculateFanGeneration(state);
}

/**
 * Estimates time to reach target fan count
 *
 * Calculates how long it will take to reach a target number of fans
 * at the current growth rate.
 *
 * @param state - Current game state
 * @param targetFans - Target fan count
 * @returns Estimated time in seconds, or Infinity if not possible
 */
export function getTimeToReachFans(state: GameState, targetFans: number): number {
	const currentFans = state.currentArtist.fans;

	if (currentFans >= targetFans) {
		return 0; // Already reached
	}

	const fansPerSecond = calculateFanGeneration(state);

	if (fansPerSecond <= 0) {
		return Infinity; // Can't reach if not generating fans
	}

	const fansNeeded = targetFans - currentFans;
	return fansNeeded / fansPerSecond;
}

/**
 * Calculates legacy artist fan contribution
 *
 * Legacy artists from prestiges can funnel fans to the new artist
 * through "cross-promotion" mechanics.
 *
 * @param state - Current game state
 * @returns Fans per second from legacy artist cross-promotion
 */
export function calculateLegacyFanContribution(state: GameState): number {
	// Legacy artists slowly funnel fans to new artist
	// This is a small percentage of their fan base per second
	const CROSS_PROMOTION_RATE = 0.001; // 0.1% of legacy fans per second

	let totalContribution = 0;

	for (const legacyArtist of state.legacyArtists) {
		totalContribution += legacyArtist.fans * CROSS_PROMOTION_RATE;
	}

	return totalContribution;
}
