/**
 * Tests for Prestige System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '$lib/game/config';
import {
	canPrestige,
	performPrestige,
	calculateLegacyIncome,
	applyLegacyIncome,
	getPrestigeBonus,
	calculatePrestigeStrength,
	getRecommendedPrestigeThreshold,
	MAX_LEGACY_ARTISTS,
	LEGACY_INCOME_MULTIPLIER
} from './prestige';
import type { GameState } from '$lib/game/types';

describe('Prestige System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
	});

	describe('canPrestige', () => {
		it('should return false when prestige not unlocked', () => {
			state.unlockedSystems.prestige = false;
			expect(canPrestige(state)).toBe(false);
		});

		it('should return true when prestige is unlocked', () => {
			state.unlockedSystems.prestige = true;
			expect(canPrestige(state)).toBe(true);
		});
	});

	describe('performPrestige', () => {
		beforeEach(() => {
			// Set up state for prestige
			state.unlockedSystems.prestige = true;
			state.currentArtist.name = 'Test Artist';
			state.currentArtist.totalSongs = 100;
			state.currentArtist.fans = 1000;
			state.currentArtist.peakFans = 1500;
			state.money = 5000;
			state.totalCompletedSongs = 100;
		});

		it('should fail when prestige not unlocked', () => {
			state.unlockedSystems.prestige = false;
			const result = performPrestige(state);
			expect(result).toBe(false);
		});

		it('should create legacy artist from current artist', () => {
			const artistName = state.currentArtist.name;
			const totalSongs = state.currentArtist.totalSongs;
			const fans = state.currentArtist.fans;

			performPrestige(state);

			expect(state.legacyArtists).toHaveLength(1);
			expect(state.legacyArtists[0].name).toBe(artistName);
			expect(state.legacyArtists[0].totalSongs).toBe(totalSongs);
			expect(state.legacyArtists[0].fans).toBe(fans);
			expect(state.legacyArtists[0].incomeMultiplier).toBe(LEGACY_INCOME_MULTIPLIER);
		});

		it('should generate new artist name', () => {
			const oldName = state.currentArtist.name;
			performPrestige(state);

			expect(state.currentArtist.name).not.toBe(oldName);
			expect(state.currentArtist.name.length).toBeGreaterThan(0);
		});

		it('should reset current artist stats', () => {
			performPrestige(state);

			expect(state.currentArtist.totalSongs).toBe(0);
			expect(state.currentArtist.fans).toBe(0);
			expect(state.currentArtist.peakFans).toBe(0);
		});

		it('should reset progression', () => {
			performPrestige(state);

			expect(state.money).toBe(0);
			expect(state.totalCompletedSongs).toBe(0);
			expect(state.songsInQueue).toBe(0);
			expect(state.currentSongProgress).toBe(0);
		});

		it('should increment prestige counter', () => {
			const initialPrestiges = state.totalPrestiges;
			performPrestige(state);

			expect(state.totalPrestiges).toBe(initialPrestiges + 1);
		});

		it('should increase experience multiplier', () => {
			const initialMultiplier = state.experienceMultiplier;
			performPrestige(state);

			expect(state.experienceMultiplier).toBeGreaterThan(initialMultiplier);
		});

		it('should limit legacy artists to max 3', () => {
			// Prestige 4 times
			for (let i = 0; i < 4; i++) {
				state.currentArtist.totalSongs = 100;
				state.currentArtist.fans = 1000;
				performPrestige(state);
			}

			expect(state.legacyArtists.length).toBe(MAX_LEGACY_ARTISTS);
		});

		it('should preserve industry control', () => {
			state.industryControl = 25.5;
			performPrestige(state);

			expect(state.industryControl).toBe(25.5);
		});

		it('should clear active boosts', () => {
			state.activeBoosts = [
				{
					abilityId: 'test',
					name: 'Test Boost',
					multiplier: 2.0,
					expiresAt: Date.now() + 10000,
					type: 'income'
				}
			];

			performPrestige(state);
			expect(state.activeBoosts).toHaveLength(0);
		});

		it('should clear active album', () => {
			state.activeAlbumBatch = {
				id: 'test',
				name: 'Test Album',
				releaseTime: Date.now(),
				copiesPressed: 1000,
				copiesRemaining: 500,
				pricePerCopy: 10,
				revenueGenerated: 5000,
				pressTimestamp: Date.now()
			};

			performPrestige(state);
			expect(state.activeAlbumBatch).toBeNull();
		});

		it('should clear active tour', () => {
			state.activeTour = {
				id: 'test',
				name: 'Test Tour',
				tier: 1,
				startTime: Date.now(),
				endTime: Date.now() + 10000,
				durationSeconds: 10,
				revenueMultiplier: 2.0,
				cost: 1000
			};

			performPrestige(state);
			expect(state.activeTour).toBeNull();
		});
	});

	describe('calculateLegacyIncome', () => {
		it('should return 0 with no legacy artists', () => {
			const income = calculateLegacyIncome(state);
			expect(income).toBe(0);
		});

		it('should calculate income from legacy artists', () => {
			state.legacyArtists = [
				{
					name: 'Legacy 1',
					totalSongs: 100,
					fans: 1000,
					incomeMultiplier: LEGACY_INCOME_MULTIPLIER,
					createdAt: Date.now()
				}
			];

			const income = calculateLegacyIncome(state);
			expect(income).toBeGreaterThan(0);

			// Expected: (100 * 1000 / 100) * 0.8 = 800
			expect(income).toBe(800);
		});

		it('should sum income from multiple legacy artists', () => {
			state.legacyArtists = [
				{
					name: 'Legacy 1',
					totalSongs: 100,
					fans: 1000,
					incomeMultiplier: LEGACY_INCOME_MULTIPLIER,
					createdAt: Date.now()
				},
				{
					name: 'Legacy 2',
					totalSongs: 50,
					fans: 500,
					incomeMultiplier: LEGACY_INCOME_MULTIPLIER,
					createdAt: Date.now()
				}
			];

			const income = calculateLegacyIncome(state);
			// Expected: (100*1000/100)*0.8 + (50*500/100)*0.8 = 800 + 200 = 1000
			expect(income).toBe(1000);
		});
	});

	describe('applyLegacyIncome', () => {
		it('should not change money with no legacy artists', () => {
			const initialMoney = state.money;
			applyLegacyIncome(state, 1.0);

			expect(state.money).toBe(initialMoney);
		});

		it('should add legacy income to money', () => {
			state.legacyArtists = [
				{
					name: 'Legacy 1',
					totalSongs: 100,
					fans: 1000,
					incomeMultiplier: LEGACY_INCOME_MULTIPLIER,
					createdAt: Date.now()
				}
			];

			const initialMoney = state.money;
			applyLegacyIncome(state, 1.0); // 1 second

			const expectedIncome = 800; // From calculateLegacyIncome test
			expect(state.money).toBe(initialMoney + expectedIncome);
		});

		it('should scale income by delta time', () => {
			state.legacyArtists = [
				{
					name: 'Legacy 1',
					totalSongs: 100,
					fans: 1000,
					incomeMultiplier: LEGACY_INCOME_MULTIPLIER,
					createdAt: Date.now()
				}
			];

			const initialMoney = state.money;
			applyLegacyIncome(state, 0.5); // Half second

			const expectedIncome = 400; // 800 * 0.5
			expect(state.money).toBe(initialMoney + expectedIncome);
		});
	});

	describe('getPrestigeBonus', () => {
		it('should return no bonus message with 0 prestiges', () => {
			state.totalPrestiges = 0;
			const bonus = getPrestigeBonus(state);

			expect(bonus).toContain('No prestige bonuses');
		});

		it('should return bonus description with prestiges', () => {
			state.totalPrestiges = 2;
			state.experienceMultiplier = 1.2; // +20%

			const bonus = getPrestigeBonus(state);
			expect(bonus).toContain('Experience');
			expect(bonus).toContain('20%');
		});
	});

	describe('calculatePrestigeStrength', () => {
		it('should calculate strength based on fans and songs', () => {
			state.currentArtist.fans = 1000;
			state.currentArtist.totalSongs = 100;

			const strength = calculatePrestigeStrength(state);
			expect(strength).toBeGreaterThan(0);
		});

		it('should increase with more fans', () => {
			state.currentArtist.totalSongs = 100;

			state.currentArtist.fans = 100;
			const strength1 = calculatePrestigeStrength(state);

			state.currentArtist.fans = 10000;
			const strength2 = calculatePrestigeStrength(state);

			expect(strength2).toBeGreaterThan(strength1);
		});

		it('should increase with more songs', () => {
			state.currentArtist.fans = 1000;

			state.currentArtist.totalSongs = 10;
			const strength1 = calculatePrestigeStrength(state);

			state.currentArtist.totalSongs = 1000;
			const strength2 = calculatePrestigeStrength(state);

			expect(strength2).toBeGreaterThan(strength1);
		});
	});

	describe('getRecommendedPrestigeThreshold', () => {
		it('should return a positive threshold', () => {
			const threshold = getRecommendedPrestigeThreshold();
			expect(threshold).toBeGreaterThan(0);
		});
	});
});
