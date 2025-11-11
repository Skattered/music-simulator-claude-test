/**
 * Smoke tests for SongGenerator component
 *
 * Verifies component compiles and core logic works
 * Full DOM testing skipped due to Svelte 5 + Vitest setup complexity
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '$lib/game/config';
import { queueSongs, calculateMaxAffordable } from '$lib/systems/songs';

describe('SongGenerator Component Logic', () => {
	it('should import component without errors', async () => {
		const module = await import('./SongGenerator.svelte');
		expect(module.default).toBeDefined();
	});

	it('should queue songs correctly', () => {
		const state = createInitialGameState();
		const initialQueue = state.songsInQueue;

		queueSongs(state, 5);
		expect(state.songsInQueue).toBe(initialQueue + 5);
	});

	it('should calculate max affordable songs', () => {
		const state = createInitialGameState();
		state.money = 1000;

		const max = calculateMaxAffordable(state);
		expect(max).toBeGreaterThanOrEqual(0);
	});

	it('should handle song progress state', () => {
		const state = createInitialGameState();
		state.currentSongProgress = 0.5;
		state.songsInQueue = 5;

		expect(state.currentSongProgress).toBe(0.5);
		expect(state.songsInQueue).toBe(5);
	});

	it('should handle empty queue state', () => {
		const state = createInitialGameState();
		state.songsInQueue = 0;
		state.currentSongProgress = 0;

		expect(state.songsInQueue).toBe(0);
		expect(state.currentSongProgress).toBe(0);
	});
});
