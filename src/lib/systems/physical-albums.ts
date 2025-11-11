/**
 * Music Industry Simulator - Physical Albums System
 *
 * Allows players to press physical albums (vinyl, CDs, cassettes) and sell them.
 * Albums require upfront investment but provide revenue over time as copies sell.
 *
 * KEY MECHANICS:
 * - Press album batches with a fixed number of copies
 * - Each copy has a price (player sets)
 * - Copies sell over time based on demand
 * - Demand decays over time (older albums sell slower)
 * - Only one album can be active at a time
 * - Revenue goes directly to money
 *
 * ALBUM FLOW:
 * 1. Player presses album (pays cost)
 * 2. Album becomes active with full copies
 * 3. Copies sell gradually based on demand
 * 4. When sold out or player presses new album, batch completes
 */

import type { GameState, PhysicalAlbum } from '$lib/game/types';
import { generateAlbumName } from '$lib/data/names';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base cost per copy to press
 */
export const BASE_PRESS_COST = 5;

/**
 * Base copies per album batch
 */
export const BASE_COPIES = 100;

/**
 * Base price per copy (player can adjust)
 */
export const BASE_PRICE_PER_COPY = 15;

/**
 * Base sell rate (copies per second)
 */
export const BASE_SELL_RATE = 0.5;

/**
 * Demand decay rate (per hour)
 * After 1 hour, demand is at 50%
 */
export const DEMAND_DECAY_RATE = 0.5 / 3600;

/**
 * Check if player can press an album
 *
 * Requirements:
 * - Physical albums system must be unlocked
 * - Player must have enough money to press
 * - Optional: No active album (or allow replacing)
 *
 * @param state - Current game state
 * @param copies - Number of copies to press
 * @returns True if player can press album
 *
 * @example
 * ```typescript
 * if (canPressAlbum(state, 100)) {
 *   // Show press button
 * }
 * ```
 */
export function canPressAlbum(state: GameState, copies: number = BASE_COPIES): boolean {
	// Check if physical albums unlocked
	if (!state.unlockedSystems.physicalAlbums) {
		return false;
	}

	// Check if can afford
	const cost = calculatePressCost(copies);
	return state.money >= cost;
}

/**
 * Calculate cost to press an album
 *
 * @param copies - Number of copies to press
 * @returns Total cost
 *
 * @example
 * ```typescript
 * const cost = calculatePressCost(100);
 * console.log(`Cost: $${cost}`);
 * ```
 */
export function calculatePressCost(copies: number): number {
	return copies * BASE_PRESS_COST;
}

/**
 * Press a new album batch
 *
 * Creates a new physical album batch and deducts cost.
 * If an album is already active, it's replaced (player loses remaining copies).
 *
 * @param state - Current game state (mutated)
 * @param copies - Number of copies to press
 * @param pricePerCopy - Price per copy (optional, defaults to base)
 * @returns True if successful
 *
 * @example
 * ```typescript
 * if (pressAlbum(state, 100, 15)) {
 *   console.log('Album pressed!');
 * }
 * ```
 */
export function pressAlbum(
	state: GameState,
	copies: number = BASE_COPIES,
	pricePerCopy: number = BASE_PRICE_PER_COPY
): boolean {
	// Check if can press
	if (!canPressAlbum(state, copies)) {
		console.warn('[Albums] Cannot press album');
		return false;
	}

	// Calculate cost
	const cost = calculatePressCost(copies);

	// Deduct cost
	state.money -= cost;

	// Create album
	const album: PhysicalAlbum = {
		id: uuidv4(),
		name: generateAlbumName(),
		releaseTime: Date.now(),
		copiesPressed: copies,
		copiesRemaining: copies,
		pricePerCopy: pricePerCopy,
		revenueGenerated: 0,
		pressTimestamp: Date.now()
	};

	// Set as active album
	state.activeAlbumBatch = album;
	state.lastAlbumTimestamp = Date.now();
	state.totalAlbumsReleased += 1;

	console.log(`[Albums] Pressed ${album.name} - ${copies} copies @ $${pricePerCopy} each`);
	return true;
}

/**
 * Calculate current demand multiplier
 *
 * Demand decays over time since album was pressed.
 * Newer albums sell faster than older ones.
 *
 * @param album - Physical album
 * @returns Demand multiplier (0-1)
 *
 * @example
 * ```typescript
 * const demand = calculateDemand(album);
 * console.log(`Demand: ${(demand * 100).toFixed(0)}%`);
 * ```
 */
export function calculateDemand(album: PhysicalAlbum): number {
	const now = Date.now();
	const ageSeconds = (now - album.pressTimestamp) / 1000;

	// Decay formula: e^(-decay_rate * age)
	const demand = Math.exp(-DEMAND_DECAY_RATE * ageSeconds);

	// Clamp between 0 and 1
	return Math.max(0, Math.min(1, demand));
}

/**
 * Process album sales
 *
 * Called each game tick to sell copies and generate revenue.
 *
 * @param state - Current game state (mutated)
 * @param deltaTime - Time elapsed in seconds
 *
 * @example
 * ```typescript
 * // In game loop:
 * processAlbumSales(state, deltaTime);
 * ```
 */
export function processAlbumSales(state: GameState, deltaTime: number): void {
	// Check if album is active
	if (!state.activeAlbumBatch) {
		return;
	}

	const album = state.activeAlbumBatch;

	// Check if sold out
	if (album.copiesRemaining <= 0) {
		// Album sold out - remove it
		state.activeAlbumBatch = null;
		return;
	}

	// Calculate demand
	const demand = calculateDemand(album);

	// Calculate sell rate (copies per second)
	// Formula: BASE_SELL_RATE * demand * fan_multiplier
	const fanMultiplier = 1 + Math.log10(Math.max(1, state.currentArtist.fans)) * 0.1;
	const sellRate = BASE_SELL_RATE * demand * fanMultiplier;

	// Calculate copies sold this tick
	const copiesSold = Math.min(album.copiesRemaining, sellRate * deltaTime);

	// Generate revenue
	const revenue = copiesSold * album.pricePerCopy;
	state.money += revenue;

	// Update album
	album.copiesRemaining -= copiesSold;
	album.revenueGenerated += revenue;

	// If sold out, clear active album
	if (album.copiesRemaining <= 0) {
		console.log(
			`[Albums] ${album.name} sold out! Revenue: $${album.revenueGenerated.toFixed(2)}`
		);
		state.activeAlbumBatch = null;
	}
}

/**
 * Calculate potential revenue for an album
 *
 * Estimates total revenue if all copies sell at current price.
 *
 * @param copies - Number of copies
 * @param pricePerCopy - Price per copy
 * @returns Potential revenue
 *
 * @example
 * ```typescript
 * const potential = calculatePotentialRevenue(100, 15);
 * console.log(`Potential revenue: $${potential}`);
 * ```
 */
export function calculatePotentialRevenue(copies: number, pricePerCopy: number): number {
	return copies * pricePerCopy;
}

/**
 * Calculate net profit for an album
 *
 * Potential revenue minus press cost.
 *
 * @param copies - Number of copies
 * @param pricePerCopy - Price per copy
 * @returns Net profit
 *
 * @example
 * ```typescript
 * const profit = calculateNetProfit(100, 15);
 * console.log(`Net profit: $${profit}`);
 * ```
 */
export function calculateNetProfit(copies: number, pricePerCopy: number): number {
	const revenue = calculatePotentialRevenue(copies, pricePerCopy);
	const cost = calculatePressCost(copies);
	return revenue - cost;
}

/**
 * Get album status description
 *
 * Returns a human-readable status of the active album.
 *
 * @param state - Current game state
 * @returns Status description or null if no active album
 *
 * @example
 * ```typescript
 * const status = getAlbumStatus(state);
 * if (status) {
 *   console.log(status);
 * }
 * ```
 */
export function getAlbumStatus(state: GameState): string | null {
	if (!state.activeAlbumBatch) {
		return null;
	}

	const album = state.activeAlbumBatch;
	const demand = calculateDemand(album);
	const copiesSold = album.copiesPressed - album.copiesRemaining;
	const percentSold = (copiesSold / album.copiesPressed) * 100;

	return `${album.name}: ${copiesSold}/${album.copiesPressed} sold (${percentSold.toFixed(0)}%) - Demand: ${(demand * 100).toFixed(0)}%`;
}
