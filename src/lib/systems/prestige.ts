/**
 * Music Industry Simulator - Prestige System
 *
 * Allows players to start over with a new artist while keeping legacy artists.
 * Legacy artists provide passive income based on their stats when prestiged.
 *
 * KEY MECHANICS:
 * - Prestige creates a new artist with fresh stats
 * - Current artist becomes a legacy artist (max 3)
 * - Legacy artists provide 80% of their original income
 * - Legacy artists' income is passive (no active management)
 * - Prestige increases experience multiplier for faster progression
 * - Prestige requires unlocking via tech upgrades
 *
 * PRESTIGE FLOW:
 * 1. Check if prestige is unlocked
 * 2. Calculate legacy artist stats (fans, songs, income multiplier)
 * 3. Add current artist to legacy list (max 3, oldest removed)
 * 4. Reset current artist with new name and fresh stats
 * 5. Increment prestige counter
 * 6. Apply prestige bonuses (experience multiplier)
 */

import type { GameState, LegacyArtist } from '$lib/game/types';
import { generateArtistName } from '$lib/data/names';

/**
 * Maximum number of legacy artists
 */
export const MAX_LEGACY_ARTISTS = 3;

/**
 * Income multiplier for legacy artists (80% of original)
 */
export const LEGACY_INCOME_MULTIPLIER = 0.8;

/**
 * Experience multiplier per prestige (10% per prestige)
 */
export const EXPERIENCE_MULTIPLIER_PER_PRESTIGE = 0.1;

/**
 * Check if player can prestige
 *
 * Requirements:
 * - Prestige system must be unlocked via tech upgrades
 * - Player should have some progress (optional min fans/songs)
 *
 * @param state - Current game state
 * @returns True if player can prestige
 *
 * @example
 * ```typescript
 * if (canPrestige(state)) {
 *   // Show prestige button
 * }
 * ```
 */
export function canPrestige(state: GameState): boolean {
	// Check if prestige is unlocked
	if (!state.unlockedSystems.prestige) {
		return false;
	}

	// Optional: Require minimum progress (commented out for flexibility)
	// const minFans = 100;
	// const minSongs = 10;
	// return state.currentArtist.fans >= minFans && state.totalCompletedSongs >= minSongs;

	return true;
}

/**
 * Perform prestige
 *
 * Creates a new artist and adds current artist to legacy list.
 * Resets most game state while preserving:
 * - Legacy artists
 * - Total prestiges
 * - Industry control (persists through prestige)
 * - Unlocked systems
 * - Purchased upgrades (optional - can be reset based on balance)
 *
 * @param state - Current game state (mutated)
 * @returns True if prestige successful
 *
 * @example
 * ```typescript
 * if (performPrestige(state)) {
 *   console.log('Prestiged to new artist!');
 * }
 * ```
 */
export function performPrestige(state: GameState): boolean {
	// Check if can prestige
	if (!canPrestige(state)) {
		console.warn('[Prestige] Cannot prestige - requirements not met');
		return false;
	}

	// Create legacy artist from current artist
	const legacyArtist: LegacyArtist = {
		name: state.currentArtist.name,
		totalSongs: state.currentArtist.totalSongs,
		fans: state.currentArtist.fans,
		incomeMultiplier: LEGACY_INCOME_MULTIPLIER,
		createdAt: Date.now()
	};

	// Add to legacy artists (remove oldest if at max)
	state.legacyArtists.push(legacyArtist);
	if (state.legacyArtists.length > MAX_LEGACY_ARTISTS) {
		state.legacyArtists.shift(); // Remove oldest
	}

	// Increment prestige counter
	state.totalPrestiges += 1;

	// Update experience multiplier
	state.experienceMultiplier = 1.0 + state.totalPrestiges * EXPERIENCE_MULTIPLIER_PER_PRESTIGE;

	// Reset current artist
	state.currentArtist = {
		name: generateArtistName(),
		totalSongs: 0,
		fans: 0,
		peakFans: 0
	};

	// Reset progression (songs, money kept based on balance preference)
	// Option 1: Reset everything
	state.money = 0;
	state.totalCompletedSongs = 0;
	state.songsInQueue = 0;
	state.currentSongProgress = 0;

	// Option 2: Keep some money (commented out)
	// state.money = Math.floor(state.money * 0.1); // Keep 10%

	// Reset tech tier but keep upgrades (allows continued progression)
	// If you want to reset upgrades too, uncomment these lines:
	// state.currentTechTier = 1;
	// state.purchasedUpgrades = ['tech_1_1'];

	// Reset temporary systems
	state.activeBoosts = [];
	state.activeAlbumBatch = null;
	state.activeTour = null;

	// Industry control persists (this is the long-term meta progression)
	// state.industryControl stays the same

	console.log(`[Prestige] Prestiged to ${state.currentArtist.name}! Total prestiges: ${state.totalPrestiges}`);
	return true;
}

/**
 * Calculate total legacy income
 *
 * Sums up passive income from all legacy artists.
 * Each legacy artist provides income based on their fans and songs.
 *
 * @param state - Current game state
 * @returns Total legacy income per second
 *
 * @example
 * ```typescript
 * const legacyIncome = calculateLegacyIncome(state);
 * console.log(`Legacy income: $${legacyIncome.toFixed(2)}/s`);
 * ```
 */
export function calculateLegacyIncome(state: GameState): number {
	let totalIncome = 0;

	for (const legacy of state.legacyArtists) {
		// Calculate legacy artist's income
		// Formula: (songs * fans * income_multiplier) / 100
		// This is simplified; adjust based on your income formula
		const baseIncome = (legacy.totalSongs * legacy.fans) / 100;
		const legacyIncome = baseIncome * legacy.incomeMultiplier;
		totalIncome += legacyIncome;
	}

	return totalIncome;
}

/**
 * Apply legacy income to game state
 *
 * Called each game tick to add passive income from legacy artists.
 *
 * @param state - Current game state (mutated)
 * @param deltaTime - Time elapsed in seconds
 *
 * @example
 * ```typescript
 * // In game loop:
 * applyLegacyIncome(state, deltaTime);
 * ```
 */
export function applyLegacyIncome(state: GameState, deltaTime: number): void {
	const legacyIncome = calculateLegacyIncome(state);
	if (legacyIncome > 0) {
		state.money += legacyIncome * deltaTime;
	}
}

/**
 * Get prestige bonus description
 *
 * Returns a human-readable description of prestige bonuses.
 *
 * @param state - Current game state
 * @returns Prestige bonus description
 *
 * @example
 * ```typescript
 * const bonus = getPrestigeBonus(state);
 * console.log(bonus); // "Experience: +20%"
 * ```
 */
export function getPrestigeBonus(state: GameState): string {
	if (state.totalPrestiges === 0) {
		return 'No prestige bonuses yet';
	}

	const expBonus = (state.experienceMultiplier - 1) * 100;
	return `Experience: +${expBonus.toFixed(0)}%`;
}

/**
 * Calculate prestige strength
 *
 * Estimates how strong the next prestige would be based on current progress.
 * Used to help players decide when to prestige.
 *
 * @param state - Current game state
 * @returns Prestige strength score (0-100+)
 *
 * @example
 * ```typescript
 * const strength = calculatePrestigeStrength(state);
 * if (strength > 50) {
 *   console.log('Good time to prestige!');
 * }
 * ```
 */
export function calculatePrestigeStrength(state: GameState): number {
	// Formula: Based on fans and songs
	// Higher = better prestige reward
	const fanScore = Math.log10(Math.max(1, state.currentArtist.fans));
	const songScore = Math.log10(Math.max(1, state.currentArtist.totalSongs));

	return fanScore + songScore;
}

/**
 * Get recommended prestige threshold
 *
 * Suggests when player should prestige for optimal progression.
 *
 * @param state - Current game state
 * @returns Recommended prestige strength threshold
 */
export function getRecommendedPrestigeThreshold(): number {
	// Prestige when strength reaches ~20
	// This is a balance between too early and too late
	return 20;
}
