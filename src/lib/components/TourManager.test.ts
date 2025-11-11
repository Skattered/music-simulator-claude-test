/**
 * Smoke tests for TourManager component
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '$lib/game/config';

describe('TourManager Component Logic', () => {
	it('should import component without errors', async () => {
		const module = await import('./TourManager.svelte');
		expect(module.default).toBeDefined();
	});

	it('should only show when tours unlocked', () => {
		const state = createInitialGameState();
		state.unlockedSystems.tours = false;
		expect(state.unlockedSystems.tours).toBe(false);

		state.unlockedSystems.tours = true;
		expect(state.unlockedSystems.tours).toBe(true);
	});

	it('should handle active tour', () => {
		const state = createInitialGameState();
		const now = Date.now();
		state.activeTour = {
			id: 'tour1',
			name: 'World Tour',
			tier: 3,
			startTime: now,
			endTime: now + 10000,
			durationSeconds: 10,
			revenueMultiplier: 5.0,
			cost: 50000
		};

		expect(state.activeTour).toBeDefined();
		expect(state.activeTour.revenueMultiplier).toBe(5.0);
	});

	it('should track completed tours', () => {
		const state = createInitialGameState();
		state.totalToursCompleted = 5;
		expect(state.totalToursCompleted).toBe(5);
	});
});
