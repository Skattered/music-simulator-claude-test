/**
 * Music Industry Simulator - Song Generation System
 *
 * Handles song generation, queue management, and completion.
 *
 * Key Mechanics:
 * - Songs are tracked as simple counters (totalCompletedSongs, songsInQueue)
 * - currentSongProgress tracks progress (0-1) of song being generated
 * - Generation time based on tech tier (30s → instant)
 * - Songs become FREE at tech tier 2+
 * - All bonuses apply globally - no per-song data stored
 *
 * Song State Tracking:
 * - totalCompletedSongs: increments on completion, never decreases
 * - songsInQueue: number of songs waiting to be generated
 * - currentSongProgress: 0-1 progress of current song
 */

import type { GameState } from '$lib/game/types';
import { getTechTier } from '$lib/game/config';

/**
 * Queues songs for generation
 *
 * Adds songs to the queue based on how many the player can afford.
 * Songs become FREE at tech tier 2+.
 *
 * @param state - Current game state
 * @param count - Number of songs to queue
 * @returns True if songs were queued, false if can't afford
 *
 * @example
 * ```typescript
 * // Queue 5 songs
 * if (queueSongs(state, 5)) {
 *   console.log('5 songs queued');
 * }
 * ```
 */
export function queueSongs(state: GameState, count: number): boolean {
	const cost = calculateSongCost(state, count);

	// Check if player can afford
	if (state.money < cost) {
		return false;
	}

	// Deduct cost and add to queue
	state.money -= cost;
	state.songsInQueue += count;

	return true;
}

/**
 * Calculates the cost to queue N songs
 *
 * Cost depends on current tech tier:
 * - Tier 1: $1 per song
 * - Tier 2+: FREE
 *
 * @param state - Current game state
 * @param count - Number of songs to cost
 * @returns Total cost for count songs
 *
 * @example
 * ```typescript
 * const cost = calculateSongCost(state, 10);
 * console.log(`10 songs cost: $${cost}`);
 * ```
 */
export function calculateSongCost(state: GameState, count: number): number {
	const techTier = getTechTier(state.currentTechTier);

	// At tier 2+ (Lifetime Licenses), songs become FREE
	const costPerSong = techTier.songCost;

	return costPerSong * count;
}

/**
 * Processes song generation queue
 *
 * Called every tick to update song generation progress.
 * When a song completes:
 * 1. Increment totalCompletedSongs
 * 2. Decrement songsInQueue
 * 3. Reset currentSongProgress to 0
 *
 * Generation speed scales with tech tier and deltaTime.
 *
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last tick (in seconds)
 *
 * @example
 * ```typescript
 * // Called every tick from game engine
 * processSongQueue(state, 0.1); // 100ms tick
 * ```
 */
export function processSongQueue(state: GameState, deltaTime: number): void {
	// Only process if there are songs in queue
	if (state.songsInQueue <= 0) {
		return;
	}

	const techTier = getTechTier(state.currentTechTier);
	const generationTime = techTier.generationTime; // seconds per song

	// Calculate how much progress to add this tick
	// progress per second = 1 / generationTime
	// progress this tick = (1 / generationTime) * deltaTime
	const progressIncrement = generationTime > 0 ? (1 / generationTime) * deltaTime : 1;

	state.currentSongProgress += progressIncrement;

	// Check if song completed
	while (state.currentSongProgress >= 1.0 && state.songsInQueue > 0) {
		// Song completed!
		state.totalCompletedSongs += 1;
		state.songsInQueue -= 1;
		state.currentSongProgress -= 1.0; // Carry over excess progress

		// If no more songs in queue, reset progress to 0
		if (state.songsInQueue === 0) {
			state.currentSongProgress = 0;
		}
	}
}

/**
 * Calculates maximum songs player can afford to queue
 *
 * @param state - Current game state
 * @returns Maximum number of songs affordable
 *
 * @example
 * ```typescript
 * const max = calculateMaxAffordable(state);
 * queueSongs(state, max); // Queue all affordable songs
 * ```
 */
export function calculateMaxAffordable(state: GameState): number {
	const costPerSong = calculateSongCost(state, 1);

	if (costPerSong === 0) {
		// Songs are free - return a reasonable max
		// This could be based on some other constraint later
		return 100; // Queue 100 free songs at once
	}

	return Math.floor(state.money / costPerSong);
}

/**
 * Gets current generation time in seconds
 *
 * Returns how long it takes to generate one song
 * at the current tech tier.
 *
 * @param state - Current game state
 * @returns Generation time in seconds
 */
export function getGenerationTime(state: GameState): number {
	const techTier = getTechTier(state.currentTechTier);
	return techTier.generationTime;
}

/**
 * Gets estimated time remaining for current song
 *
 * Calculates time until current song completes based on
 * current progress and generation speed.
 *
 * @param state - Current game state
 * @returns Time remaining in seconds, or 0 if no song in progress
 */
export function getTimeRemaining(state: GameState): number {
	if (state.songsInQueue === 0) {
		return 0;
	}

	const generationTime = getGenerationTime(state);
	const progressRemaining = 1.0 - state.currentSongProgress;

	return progressRemaining * generationTime;
}

/**
 * Gets total estimated time for all queued songs
 *
 * @param state - Current game state
 * @returns Total time in seconds for all songs in queue
 */
export function getTotalQueueTime(state: GameState): number {
	if (state.songsInQueue === 0) {
		return 0;
	}

	const generationTime = getGenerationTime(state);

	// Time for current song + time for remaining songs
	const currentSongTime = getTimeRemaining(state);
	const remainingSongsTime = (state.songsInQueue - 1) * generationTime;

	return currentSongTime + remainingSongsTime;
}
