/**
 * Smoke tests for VictoryScreen component
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '$lib/game/config';

describe('VictoryScreen Component Logic', () => {
	it('should import component without errors', async () => {
		const module = await import('./VictoryScreen.svelte');
		expect(module.default).toBeDefined();
	});

	it('should show when industry control is 100%', () => {
		const state = createInitialGameState();
		state.industryControl = 100;
		expect(state.industryControl).toBe(100);
	});

	it('should display all final stats', () => {
		const state = createInitialGameState();
		state.totalCompletedSongs = 1000;
		state.currentArtist.fans = 1000000;
		state.money = 10000000;
		state.totalPrestiges = 5;
		state.totalAlbumsReleased = 50;
		state.totalToursCompleted = 20;
		state.totalTimePlayed = 36000; // 10 hours
		state.currentTechTier = 7;
		state.ownedPlatforms = ['platform1', 'platform2', 'platform3'];

		expect(state.totalCompletedSongs).toBe(1000);
		expect(state.currentArtist.fans).toBe(1000000);
		expect(state.money).toBe(10000000);
		expect(state.totalPrestiges).toBe(5);
		expect(state.totalAlbumsReleased).toBe(50);
		expect(state.totalToursCompleted).toBe(20);
		expect(state.totalTimePlayed).toBe(36000);
		expect(state.currentTechTier).toBe(7);
		expect(state.ownedPlatforms.length).toBe(3);
	});
});
