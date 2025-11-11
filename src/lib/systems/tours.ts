/**
 * Music Industry Simulator - Tours System
 *
 * Allows players to start tours that provide temporary revenue multipliers.
 * Tours cost money upfront but multiply ALL income during their duration.
 *
 * KEY MECHANICS:
 * - Tours have different tiers (1-5) with increasing costs and multipliers
 * - Only one tour can be active at a time
 * - Tours last for a fixed duration
 * - Revenue multiplier applies to ALL income sources (songs, albums, legacy)
 * - Tours have cooldown after ending
 * - Higher tiers = better multipliers but higher costs
 *
 * TOUR FLOW:
 * 1. Player selects tour tier and pays cost
 * 2. Tour starts with duration timer
 * 3. Revenue multiplier applied to all income
 * 4. Tour ends when duration expires
 * 5. Cooldown period before next tour
 */

import type { GameState, Tour } from '$lib/game/types';
import { generateTourName } from '$lib/data/names';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tour tier definitions
 */
export interface TourTierDefinition {
	tier: number;
	name: string;
	cost: number;
	durationSeconds: number;
	revenueMultiplier: number;
	cooldownSeconds: number;
}

/**
 * All tour tiers
 */
export const TOUR_TIERS: TourTierDefinition[] = [
	{
		tier: 1,
		name: 'Local Club Tour',
		cost: 500,
		durationSeconds: 30,
		revenueMultiplier: 1.5,
		cooldownSeconds: 60
	},
	{
		tier: 2,
		name: 'Regional Tour',
		cost: 2500,
		durationSeconds: 60,
		revenueMultiplier: 2.0,
		cooldownSeconds: 90
	},
	{
		tier: 3,
		name: 'National Tour',
		cost: 10000,
		durationSeconds: 120,
		revenueMultiplier: 3.0,
		cooldownSeconds: 120
	},
	{
		tier: 4,
		name: 'International Tour',
		cost: 50000,
		durationSeconds: 180,
		revenueMultiplier: 5.0,
		cooldownSeconds: 180
	},
	{
		tier: 5,
		name: 'World Tour',
		cost: 250000,
		durationSeconds: 300,
		revenueMultiplier: 10.0,
		cooldownSeconds: 300
	}
];

/**
 * Get tour tier definition
 *
 * @param tier - Tour tier (1-5)
 * @returns Tour tier definition or undefined
 *
 * @example
 * ```typescript
 * const tierDef = getTourTier(3);
 * console.log(tierDef.name); // "National Tour"
 * ```
 */
export function getTourTier(tier: number): TourTierDefinition | undefined {
	return TOUR_TIERS.find((t) => t.tier === tier);
}

/**
 * Check if player can start a tour
 *
 * Requirements:
 * - Tours system must be unlocked
 * - No active tour
 * - Not in cooldown
 * - Can afford tour cost
 *
 * @param state - Current game state
 * @param tier - Tour tier to check
 * @returns True if player can start tour
 *
 * @example
 * ```typescript
 * if (canStartTour(state, 1)) {
 *   // Show start tour button
 * }
 * ```
 */
export function canStartTour(state: GameState, tier: number): boolean {
	// Check if tours unlocked
	if (!state.unlockedSystems.tours) {
		return false;
	}

	// Check if tour already active
	if (state.activeTour) {
		return false;
	}

	// Check cooldown
	if (isTourOnCooldown(state)) {
		return false;
	}

	// Check if tier exists
	const tourTier = getTourTier(tier);
	if (!tourTier) {
		return false;
	}

	// Check if can afford
	return state.money >= tourTier.cost;
}

/**
 * Check if tours are on cooldown
 *
 * @param state - Current game state
 * @returns True if on cooldown
 *
 * @example
 * ```typescript
 * if (isTourOnCooldown(state)) {
 *   const remaining = getTourCooldownRemaining(state);
 *   console.log(`Cooldown: ${remaining}s`);
 * }
 * ```
 */
export function isTourOnCooldown(state: GameState): boolean {
	if (!state.lastTourEndTime) {
		return false;
	}

	const now = Date.now();
	const timeSinceEnd = (now - state.lastTourEndTime) / 1000;

	return timeSinceEnd < state.tourCooldownSeconds;
}

/**
 * Get tour cooldown remaining time
 *
 * @param state - Current game state
 * @returns Remaining cooldown in seconds (0 if not on cooldown)
 *
 * @example
 * ```typescript
 * const remaining = getTourCooldownRemaining(state);
 * console.log(`Cooldown: ${remaining.toFixed(0)}s`);
 * ```
 */
export function getTourCooldownRemaining(state: GameState): number {
	if (!isTourOnCooldown(state)) {
		return 0;
	}

	const now = Date.now();
	const timeSinceEnd = (now - state.lastTourEndTime) / 1000;
	const remaining = state.tourCooldownSeconds - timeSinceEnd;

	return Math.max(0, remaining);
}

/**
 * Start a tour
 *
 * Creates a new tour and deducts cost.
 * Sets tour as active with start/end times.
 *
 * @param state - Current game state (mutated)
 * @param tier - Tour tier (1-5)
 * @returns True if successful
 *
 * @example
 * ```typescript
 * if (startTour(state, 2)) {
 *   console.log('Regional tour started!');
 * }
 * ```
 */
export function startTour(state: GameState, tier: number): boolean {
	// Check if can start
	if (!canStartTour(state, tier)) {
		console.warn('[Tours] Cannot start tour');
		return false;
	}

	// Get tour tier definition
	const tourTier = getTourTier(tier);
	if (!tourTier) {
		console.warn(`[Tours] Invalid tier: ${tier}`);
		return false;
	}

	// Deduct cost
	state.money -= tourTier.cost;

	// Create tour
	const now = Date.now();
	const tour: Tour = {
		id: uuidv4(),
		name: generateTourName(),
		tier: tier,
		startTime: now,
		endTime: now + tourTier.durationSeconds * 1000,
		durationSeconds: tourTier.durationSeconds,
		revenueMultiplier: tourTier.revenueMultiplier,
		cost: tourTier.cost
	};

	// Set as active tour
	state.activeTour = tour;

	console.log(
		`[Tours] Started ${tour.name} (${tourTier.name}) - ${tourTier.revenueMultiplier}x for ${tourTier.durationSeconds}s`
	);
	return true;
}

/**
 * Process active tour
 *
 * Checks if tour has ended and handles cleanup.
 * Call this each game tick.
 *
 * @param state - Current game state (mutated)
 *
 * @example
 * ```typescript
 * // In game loop:
 * processTour(state);
 * ```
 */
export function processTour(state: GameState): void {
	// Check if tour is active
	if (!state.activeTour) {
		return;
	}

	const tour = state.activeTour;
	const now = Date.now();

	// Check if tour has ended
	if (now >= tour.endTime) {
		// Tour ended
		console.log(`[Tours] ${tour.name} ended!`);

		// Get tier for cooldown
		const tourTier = getTourTier(tour.tier);
		if (tourTier) {
			state.tourCooldownSeconds = tourTier.cooldownSeconds;
		}

		// Set last tour end time
		state.lastTourEndTime = now;

		// Clear active tour
		state.activeTour = null;

		// Increment total tours completed
		state.totalToursCompleted += 1;
	}
}

/**
 * Get active tour multiplier
 *
 * Returns the revenue multiplier from active tour, or 1.0 if no tour active.
 * Use this when calculating income to apply tour bonus.
 *
 * @param state - Current game state
 * @returns Revenue multiplier (1.0+ if tour active, 1.0 otherwise)
 *
 * @example
 * ```typescript
 * const income = baseIncome * getTourMultiplier(state);
 * ```
 */
export function getTourMultiplier(state: GameState): number {
	if (!state.activeTour) {
		return 1.0;
	}

	return state.activeTour.revenueMultiplier;
}

/**
 * Get tour remaining time
 *
 * @param state - Current game state
 * @returns Remaining time in seconds (0 if no active tour)
 *
 * @example
 * ```typescript
 * const remaining = getTourRemainingTime(state);
 * console.log(`Tour ends in ${remaining.toFixed(0)}s`);
 * ```
 */
export function getTourRemainingTime(state: GameState): number {
	if (!state.activeTour) {
		return 0;
	}

	const now = Date.now();
	const remaining = (state.activeTour.endTime - now) / 1000;

	return Math.max(0, remaining);
}

/**
 * Get tour status description
 *
 * Returns a human-readable status of the active tour or cooldown.
 *
 * @param state - Current game state
 * @returns Status description or null
 *
 * @example
 * ```typescript
 * const status = getTourStatus(state);
 * if (status) {
 *   console.log(status);
 * }
 * ```
 */
export function getTourStatus(state: GameState): string | null {
	if (state.activeTour) {
		const remaining = getTourRemainingTime(state);
		return `${state.activeTour.name} - ${remaining.toFixed(0)}s remaining (${state.activeTour.revenueMultiplier}x revenue)`;
	}

	if (isTourOnCooldown(state)) {
		const remaining = getTourCooldownRemaining(state);
		return `Cooldown: ${remaining.toFixed(0)}s`;
	}

	return null;
}

/**
 * Calculate tour ROI (Return on Investment)
 *
 * Estimates if a tour is profitable based on current income.
 *
 * @param state - Current game state
 * @param tier - Tour tier to calculate
 * @param currentIncomePerSecond - Current income per second
 * @returns Estimated profit/loss
 *
 * @example
 * ```typescript
 * const roi = calculateTourROI(state, 1, 100);
 * if (roi > 0) {
 *   console.log('Tour is profitable!');
 * }
 * ```
 */
export function calculateTourROI(
	state: GameState,
	tier: number,
	currentIncomePerSecond: number
): number {
	const tourTier = getTourTier(tier);
	if (!tourTier) {
		return 0;
	}

	// Calculate income during tour
	const baseIncome = currentIncomePerSecond * tourTier.durationSeconds;
	const bonusIncome = baseIncome * (tourTier.revenueMultiplier - 1);

	// ROI = bonus income - cost
	return bonusIncome - tourTier.cost;
}
