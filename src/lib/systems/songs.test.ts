/**
 * Unit tests for Song Generation System
 *
 * Tests song queuing, generation, completion, and cost calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	queueSongs,
	calculateSongCost,
	processSongQueue,
	calculateMaxAffordable,
	getGenerationTime,
	getTimeRemaining,
	getTotalQueueTime
} from './songs';
import { createInitialGameState } from '$lib/game/config';
import type { GameState } from '$lib/game/types';

describe('Song Generation System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
		state.money = 100; // Give player some starting money for tests
	});

	describe('calculateSongCost()', () => {
		it('should cost $1 per song at tier 1', () => {
			state.currentTechTier = 1;
			expect(calculateSongCost(state, 1)).toBe(1);
			expect(calculateSongCost(state, 10)).toBe(10);
		});

		it('should be free at tier 2+', () => {
			state.currentTechTier = 2;
			expect(calculateSongCost(state, 1)).toBe(0);
			expect(calculateSongCost(state, 10)).toBe(0);

			state.currentTechTier = 3;
			expect(calculateSongCost(state, 100)).toBe(0);
		});
	});

	describe('queueSongs()', () => {
		it('should queue songs and deduct cost', () => {
			state.currentTechTier = 1;
			state.money = 10;

			const success = queueSongs(state, 5);

			expect(success).toBe(true);
			expect(state.songsInQueue).toBe(5);
			expect(state.money).toBe(5); // 10 - (5 * 1)
		});

		it('should queue free songs at tier 2+', () => {
			state.currentTechTier = 2;
			state.money = 10;

			const success = queueSongs(state, 50);

			expect(success).toBe(true);
			expect(state.songsInQueue).toBe(50);
			expect(state.money).toBe(10); // No cost deducted
		});

		it('should fail if cannot afford', () => {
			state.currentTechTier = 1;
			state.money = 5;

			const success = queueSongs(state, 10); // Costs $10, only have $5

			expect(success).toBe(false);
			expect(state.songsInQueue).toBe(0);
			expect(state.money).toBe(5); // Money not deducted
		});

		it('should add to existing queue', () => {
			state.currentTechTier = 2; // Free songs
			state.songsInQueue = 5;

			queueSongs(state, 3);

			expect(state.songsInQueue).toBe(8);
		});
	});

	describe('processSongQueue()', () => {
		it('should not process if queue is empty', () => {
			state.songsInQueue = 0;
			state.totalCompletedSongs = 0;

			processSongQueue(state, 1.0);

			expect(state.totalCompletedSongs).toBe(0);
			expect(state.currentSongProgress).toBe(0);
		});

		it('should increment progress based on deltaTime', () => {
			state.currentTechTier = 1; // 30 second generation time
			state.songsInQueue = 1;
			state.currentSongProgress = 0;

			// Process for 10 seconds
			processSongQueue(state, 10.0);

			// Progress should be 10/30 = 0.333...
			expect(state.currentSongProgress).toBeCloseTo(0.333, 2);
			expect(state.totalCompletedSongs).toBe(0); // Not completed yet
		});

		it('should complete song when progress reaches 1.0', () => {
			state.currentTechTier = 1; // 30 second generation time
			state.songsInQueue = 1;
			state.currentSongProgress = 0;

			// Process for 30 seconds (full song)
			processSongQueue(state, 30.0);

			expect(state.totalCompletedSongs).toBe(1);
			expect(state.songsInQueue).toBe(0);
			expect(state.currentSongProgress).toBe(0); // Reset after completion
		});

		it('should complete multiple songs in one tick', () => {
			state.currentTechTier = 3; // 5 second generation time
			state.songsInQueue = 3;
			state.currentSongProgress = 0;

			// Process for 15 seconds (3 full songs)
			processSongQueue(state, 15.0);

			expect(state.totalCompletedSongs).toBe(3);
			expect(state.songsInQueue).toBe(0);
		});

		it('should carry over excess progress to next song', () => {
			state.currentTechTier = 1; // 30 second generation time
			state.songsInQueue = 2;
			state.currentSongProgress = 0;

			// Process for 35 seconds (1.166... songs)
			processSongQueue(state, 35.0);

			expect(state.totalCompletedSongs).toBe(1);
			expect(state.songsInQueue).toBe(1);
			expect(state.currentSongProgress).toBeCloseTo(0.166, 2); // 5/30 remaining
		});

		it('should handle very fast generation (tier 7)', () => {
			state.currentTechTier = 7; // 0.1 second generation time
			state.songsInQueue = 100;

			// Process for 1 second (should complete 10 songs)
			processSongQueue(state, 1.0);

			expect(state.totalCompletedSongs).toBe(10);
			expect(state.songsInQueue).toBe(90);
		});

		it('should stop at queue empty', () => {
			state.currentTechTier = 1; // 30 second generation time
			state.songsInQueue = 1;
			state.currentSongProgress = 0;

			// Process for way more than needed
			processSongQueue(state, 100.0);

			expect(state.totalCompletedSongs).toBe(1);
			expect(state.songsInQueue).toBe(0);
			expect(state.currentSongProgress).toBe(0); // Reset when queue empty
		});
	});

	describe('calculateMaxAffordable()', () => {
		it('should calculate max at tier 1', () => {
			state.currentTechTier = 1;
			state.money = 50;

			expect(calculateMaxAffordable(state)).toBe(50); // $1 each
		});

		it('should return cap for free songs', () => {
			state.currentTechTier = 2;
			state.money = 1000000;

			const max = calculateMaxAffordable(state);
			expect(max).toBe(100); // Reasonable cap for free songs
		});

		it('should round down for partial songs', () => {
			state.currentTechTier = 1;
			state.money = 5.7;

			expect(calculateMaxAffordable(state)).toBe(5); // Can't afford 6th
		});

		it('should return 0 if cannot afford any', () => {
			state.currentTechTier = 1;
			state.money = 0.5;

			expect(calculateMaxAffordable(state)).toBe(0);
		});
	});

	describe('getGenerationTime()', () => {
		it('should return correct time for each tier', () => {
			state.currentTechTier = 1;
			expect(getGenerationTime(state)).toBe(30); // Tier 1: 30s

			state.currentTechTier = 2;
			expect(getGenerationTime(state)).toBe(15); // Tier 2: 15s

			state.currentTechTier = 3;
			expect(getGenerationTime(state)).toBe(5); // Tier 3: 5s

			state.currentTechTier = 7;
			expect(getGenerationTime(state)).toBe(0.1); // Tier 7: 0.1s
		});
	});

	describe('getTimeRemaining()', () => {
		it('should return 0 if no songs in queue', () => {
			state.songsInQueue = 0;
			expect(getTimeRemaining(state)).toBe(0);
		});

		it('should calculate time remaining for current song', () => {
			state.currentTechTier = 1; // 30 second generation
			state.songsInQueue = 1;
			state.currentSongProgress = 0.5; // 50% done

			expect(getTimeRemaining(state)).toBeCloseTo(15, 1); // 15s remaining
		});

		it('should return full time if just started', () => {
			state.currentTechTier = 2; // 15 second generation
			state.songsInQueue = 1;
			state.currentSongProgress = 0;

			expect(getTimeRemaining(state)).toBe(15);
		});

		it('should return near-zero if almost done', () => {
			state.currentTechTier = 1; // 30 second generation
			state.songsInQueue = 1;
			state.currentSongProgress = 0.99;

			expect(getTimeRemaining(state)).toBeCloseTo(0.3, 1);
		});
	});

	describe('getTotalQueueTime()', () => {
		it('should return 0 if queue empty', () => {
			state.songsInQueue = 0;
			expect(getTotalQueueTime(state)).toBe(0);
		});

		it('should calculate time for single song', () => {
			state.currentTechTier = 1; // 30 second generation
			state.songsInQueue = 1;
			state.currentSongProgress = 0;

			expect(getTotalQueueTime(state)).toBe(30);
		});

		it('should calculate time for multiple songs', () => {
			state.currentTechTier = 2; // 15 second generation
			state.songsInQueue = 5;
			state.currentSongProgress = 0;

			expect(getTotalQueueTime(state)).toBe(75); // 5 * 15
		});

		it('should account for current progress', () => {
			state.currentTechTier = 1; // 30 second generation
			state.songsInQueue = 3;
			state.currentSongProgress = 0.5; // Current song 50% done

			// Current song: 15s remaining
			// 2 more songs: 2 * 30 = 60s
			// Total: 75s
			expect(getTotalQueueTime(state)).toBeCloseTo(75, 1);
		});
	});

	describe('integration', () => {
		it('should handle complete workflow', () => {
			state.currentTechTier = 2; // Free songs, 15s each
			state.money = 1000;
			state.totalCompletedSongs = 0;

			// Queue 10 songs
			queueSongs(state, 10);
			expect(state.songsInQueue).toBe(10);

			// Process for 45 seconds (should complete 3 songs)
			processSongQueue(state, 45.0);
			expect(state.totalCompletedSongs).toBe(3);
			expect(state.songsInQueue).toBe(7);

			// Queue 5 more
			queueSongs(state, 5);
			expect(state.songsInQueue).toBe(12);

			// Process until all complete
			processSongQueue(state, 200.0); // More than enough time

			expect(state.totalCompletedSongs).toBe(15); // 3 + 12
			expect(state.songsInQueue).toBe(0);
		});
	});
});
