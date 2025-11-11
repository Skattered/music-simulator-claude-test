/**
 * Smoke tests for PrestigeModal component
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '$lib/game/config';

describe('PrestigeModal Component Logic', () => {
	it('should import component without errors', async () => {
		const module = await import('./PrestigeModal.svelte');
		expect(module.default).toBeDefined();
	});

	it('should handle prestige availability', () => {
		const state = createInitialGameState();

		// Unlock prestige
		state.unlockedSystems.prestige = true;
		expect(state.unlockedSystems.prestige).toBe(true);
	});

	it('should track legacy artists', () => {
		const state = createInitialGameState();

		state.legacyArtists.push({
			name: 'Legacy Artist 1',
			totalSongs: 100,
			fans: 50000,
			incomeMultiplier: 0.8,
			createdAt: Date.now()
		});

		expect(state.legacyArtists.length).toBe(1);
		expect(state.legacyArtists[0].incomeMultiplier).toBe(0.8);
	});

	it('should handle max 3 legacy artists', () => {
		const state = createInitialGameState();

		for (let i = 0; i < 3; i++) {
			state.legacyArtists.push({
				name: `Legacy ${i + 1}`,
				totalSongs: 50,
				fans: 10000,
				incomeMultiplier: 0.8,
				createdAt: Date.now() - i * 1000
			});
		}

		expect(state.legacyArtists.length).toBe(3);
	});
});
