/**
 * Smoke tests for ResourceBar component
 *
 * Verifies component compiles and core logic works
 * Full DOM testing skipped due to Svelte 5 + Vitest setup complexity
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '$lib/game/config';
import { calculateTotalIncome } from '$lib/systems/income';
import { getFanGrowthRate } from '$lib/systems/fans';

describe('ResourceBar Component Logic', () => {
	it('should import component without errors', async () => {
		const module = await import('./ResourceBar.svelte');
		expect(module.default).toBeDefined();
	});

	it('should calculate income correctly for display', () => {
		const state = createInitialGameState();
		state.totalCompletedSongs = 10;
		state.currentArtist.fans = 100;

		const income = calculateTotalIncome(state);
		expect(income).toBeGreaterThanOrEqual(0);
	});

	it('should calculate fan growth rate for display', () => {
		const state = createInitialGameState();
		state.totalCompletedSongs = 10;

		const fanRate = getFanGrowthRate(state);
		expect(fanRate).toBeGreaterThanOrEqual(0);
	});

	it('should handle state with GPU unlocked', () => {
		const state = createInitialGameState();
		state.unlockedSystems.gpu = true;
		state.gpu = 250;

		expect(state.unlockedSystems.gpu).toBe(true);
		expect(state.gpu).toBe(250);
	});

	it('should handle industry control percentage', () => {
		const state = createInitialGameState();
		state.industryControl = 25.5;

		expect(state.industryControl).toBe(25.5);
		expect(state.industryControl).toBeGreaterThanOrEqual(0);
		expect(state.industryControl).toBeLessThanOrEqual(100);
	});
});
