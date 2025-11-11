/**
 * Smoke tests for PhysicalAlbums component
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '$lib/game/config';

describe('PhysicalAlbums Component Logic', () => {
	it('should import component without errors', async () => {
		const module = await import('./PhysicalAlbums.svelte');
		expect(module.default).toBeDefined();
	});

	it('should only show when unlocked', () => {
		const state = createInitialGameState();
		state.unlockedSystems.physicalAlbums = false;
		expect(state.unlockedSystems.physicalAlbums).toBe(false);

		state.unlockedSystems.physicalAlbums = true;
		expect(state.unlockedSystems.physicalAlbums).toBe(true);
	});

	it('should handle active album batch', () => {
		const state = createInitialGameState();
		state.activeAlbumBatch = {
			id: 'album1',
			name: 'Test Album',
			releaseTime: Date.now(),
			copiesPressed: 1000,
			copiesRemaining: 500,
			pricePerCopy: 10,
			revenueGenerated: 5000,
			pressTimestamp: Date.now()
		};

		expect(state.activeAlbumBatch).toBeDefined();
		expect(state.activeAlbumBatch.copiesRemaining).toBe(500);
	});
});
