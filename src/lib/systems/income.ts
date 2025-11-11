/**
 * Music Industry Simulator - Income System
 *
 * Handles income generation from songs, streaming, and other sources.
 *
 * CRITICAL BALANCE RULES (from economic balance principles):
 * - Streaming revenue formula: total_completed_songs * total_fans * BASE_STREAMING_RATE * platform_multiplier
 * - Streaming MUST remain 15-30% of total income throughout the game
 * - NO exponential multipliers allowed on streaming
 * - Scales LINEARLY with songs and fans ONLY
 * - platform_multiplier = 1.0 unless player owns streaming platform (late game)
 *
 * Income sources:
 * 1. Streaming (primary, 15-30% of total)
 * 2. Albums (burst income, added later)
 * 3. Tours (multiplier to all income, added later)
 * 4. Platform ownership (passive income, late game)
 */

import type { GameState } from '$lib/game/types';
import { BASE_STREAMING_RATE, PLATFORM_MULTIPLIER_DEFAULT, getTechTier } from '$lib/game/config';

/**
 * Generates income for the current tick
 *
 * Calculates total income from all sources and adds to player's money.
 * Called every tick from the game engine.
 *
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last tick (in seconds)
 *
 * @example
 * ```typescript
 * // Called every tick from game engine
 * generateIncome(state, 0.1); // 100ms tick
 * ```
 */
export function generateIncome(state: GameState, deltaTime: number): void {
	const totalIncome = calculateTotalIncome(state);

	// Income is per second, so multiply by deltaTime
	const incomeThisTick = totalIncome * deltaTime;

	state.money += incomeThisTick;
}

/**
 * Calculates total income per second from all sources
 *
 * Combines streaming, album sales, tours, and platform income.
 * Tour multipliers apply to ALL income sources.
 *
 * @param state - Current game state
 * @returns Total income per second
 */
export function calculateTotalIncome(state: GameState): number {
	let totalIncome = 0;

	// 1. Streaming revenue (primary source)
	totalIncome += calculateStreamingIncome(state);

	// TODO: Add other income sources in later phases
	// 2. Album sales (Phase 4)
	// 3. Platform ownership (Phase 4)

	// Apply tour multiplier to ALL income if tour is active
	totalIncome = applyTourMultiplier(state, totalIncome);

	// Apply active boost multipliers
	totalIncome = applyIncomeBoosts(state, totalIncome);

	return totalIncome;
}

/**
 * Calculates streaming income per second
 *
 * CRITICAL FORMULA (from economic balance principles):
 * streaming_revenue = total_completed_songs * total_fans * BASE_STREAMING_RATE * platform_multiplier
 *
 * Rules:
 * - BASE_STREAMING_RATE is constant (0.001)
 * - platform_multiplier = 1.0 unless player owns streaming platform
 * - NO exponential multipliers
 * - Scales LINEARLY with songs and fans
 * - Must remain 15-30% of total income
 *
 * @param state - Current game state
 * @returns Streaming income per second
 */
export function calculateStreamingIncome(state: GameState): number {
	const techTier = getTechTier(state.currentTechTier);

	// Base streaming revenue formula
	const baseStreaming =
		state.totalCompletedSongs * state.currentArtist.fans * BASE_STREAMING_RATE;

	// Apply platform multiplier (1.0 unless player owns streaming platform)
	const platformMultiplier = calculatePlatformMultiplier(state);

	// Apply tech tier income multiplier (better models = more income per stream)
	const techMultiplier = techTier.incomeMultiplier;

	// Apply experience multiplier from prestiges
	const experienceMultiplier = state.experienceMultiplier;

	return baseStreaming * platformMultiplier * techMultiplier * experienceMultiplier;
}

/**
 * Calculates platform multiplier for streaming
 *
 * Returns 1.0 by default, higher if player owns streaming platform (late game).
 *
 * @param state - Current game state
 * @returns Platform multiplier (1.0 or higher)
 */
export function calculatePlatformMultiplier(state: GameState): number {
	// Check if player owns streaming platform
	const ownsStreamingPlatform = state.ownedPlatforms.includes('streaming_platform');

	if (ownsStreamingPlatform) {
		return 1.5; // 50% boost if you own the platform
	}

	return PLATFORM_MULTIPLIER_DEFAULT; // 1.0
}

/**
 * Applies tour multiplier to income if active tour exists
 *
 * Tours provide temporary multipliers to ALL income sources.
 * IMPORTANT: Only 1 tour can be active at a time (no stacking).
 *
 * @param state - Current game state
 * @param baseIncome - Base income before tour multiplier
 * @returns Income after tour multiplier
 */
export function applyTourMultiplier(state: GameState, baseIncome: number): number {
	if (!state.activeTour) {
		return baseIncome;
	}

	// Check if tour is still active (hasn't expired)
	const now = Date.now();
	if (now < state.activeTour.endTime) {
		return baseIncome * state.activeTour.revenueMultiplier;
	}

	// Tour expired, no multiplier
	return baseIncome;
}

/**
 * Applies active income boost multipliers from exploitation abilities
 *
 * Exploitation abilities can provide temporary income boosts.
 * Multiple boosts can stack multiplicatively.
 *
 * @param state - Current game state
 * @param baseIncome - Income before boosts
 * @returns Income after all active boosts
 */
export function applyIncomeBoosts(state: GameState, baseIncome: number): number {
	let multipliedIncome = baseIncome;

	const now = Date.now();

	// Apply all active income boosts
	for (const boost of state.activeBoosts) {
		// Check if boost is still active
		if (boost.type === 'income' && now < boost.expiresAt) {
			multipliedIncome *= boost.multiplier;
		}
	}

	return multipliedIncome;
}

/**
 * Gets breakdown of income sources
 *
 * Useful for debugging and displaying to player.
 * Helps verify streaming stays within 15-30% of total.
 *
 * @param state - Current game state
 * @returns Object with income from each source
 */
export function getIncomeBreakdown(state: GameState): {
	streaming: number;
	albums: number;
	tours: number;
	platforms: number;
	total: number;
	streamingPercentage: number;
} {
	const streaming = calculateStreamingIncome(state);
	const albums = 0; // TODO: Implement in Phase 4
	const tours = 0; // Tours are multipliers, not direct income
	const platforms = 0; // TODO: Implement in Phase 4

	const total = calculateTotalIncome(state);

	const streamingPercentage = total > 0 ? streaming / total : 0;

	return {
		streaming,
		albums,
		tours,
		platforms,
		total,
		streamingPercentage
	};
}
