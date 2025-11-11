/**
 * Unit tests for Fan System
 *
 * Tests fan generation, growth, and peak tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	generateFans,
	calculateFanGeneration,
	applyFanBoosts,
	updatePeakFans,
	getFanGrowthRate,
	getTimeToReachFans,
	calculateLegacyFanContribution
} from './fans';
import { createInitialGameState } from '$lib/game/config';
import type { GameState } from '$lib/game/types';

describe('Fan System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
		state.totalCompletedSongs = 10;
		state.currentArtist.fans = 100;
	});

	describe('calculateFanGeneration()', () => {
		it('should generate fans based on songs', () => {
			// 10 songs * 0.01 BASE_FAN_RATE * 1.0 tech * 1.0 exp = 0.1 fans/sec
			const fansPerSec = calculateFanGeneration(state);
			expect(fansPerSec).toBeCloseTo(0.1, 2);
		});

		it('should return 0 if no songs', () => {
			state.totalCompletedSongs = 0;
			expect(calculateFanGeneration(state)).toBe(0);
		});

		it('should scale with number of songs', () => {
			state.totalCompletedSongs = 20;
			const fansPerSec = calculateFanGeneration(state);
			expect(fansPerSec).toBeCloseTo(0.2, 2); // Double songs = double fans
		});

		it('should apply tech tier multiplier', () => {
			state.currentTechTier = 3; // 1.5x fan multiplier
			const fansPerSec = calculateFanGeneration(state);
			expect(fansPerSec).toBeCloseTo(0.15, 2);
		});

		it('should apply experience multiplier', () => {
			state.experienceMultiplier = 2.0;
			const fansPerSec = calculateFanGeneration(state);
			expect(fansPerSec).toBeCloseTo(0.2, 2);
		});
	});

	describe('applyFanBoosts()', () => {
		it('should return base fans if no boosts', () => {
			const fans = applyFanBoosts(state, 100);
			expect(fans).toBe(100);
		});

		it('should apply active fan boosts', () => {
			state.activeBoosts.push({
				abilityId: 'playlist',
				name: 'Playlist Placement',
				multiplier: 2.0,
				expiresAt: Date.now() + 10000,
				type: 'fans'
			});

			const fans = applyFanBoosts(state, 100);
			expect(fans).toBe(200);
		});

		it('should stack multiple boosts', () => {
			state.activeBoosts.push(
				{
					abilityId: 'boost1',
					name: 'Boost 1',
					multiplier: 1.5,
					expiresAt: Date.now() + 10000,
					type: 'fans'
				},
				{
					abilityId: 'boost2',
					name: 'Boost 2',
					multiplier: 2.0,
					expiresAt: Date.now() + 10000,
					type: 'fans'
				}
			);

			const fans = applyFanBoosts(state, 100);
			expect(fans).toBe(300); // 1.5 * 2.0 = 3.0x
		});

		it('should ignore expired boosts', () => {
			state.activeBoosts.push({
				abilityId: 'expired',
				name: 'Expired',
				multiplier: 2.0,
				expiresAt: Date.now() - 1000,
				type: 'fans'
			});

			const fans = applyFanBoosts(state, 100);
			expect(fans).toBe(100);
		});

		it('should ignore non-fan boosts', () => {
			state.activeBoosts.push({
				abilityId: 'income',
				name: 'Income Boost',
				multiplier: 2.0,
				expiresAt: Date.now() + 10000,
				type: 'income' // Not fans
			});

			const fans = applyFanBoosts(state, 100);
			expect(fans).toBe(100);
		});
	});

	describe('generateFans()', () => {
		it('should increase fan count', () => {
			const initialFans = state.currentArtist.fans;
			generateFans(state, 1.0); // 1 second

			expect(state.currentArtist.fans).toBeGreaterThan(initialFans);
		});

		it('should scale by deltaTime', () => {
			const initialFans = state.currentArtist.fans;

			// Generate for 0.5 seconds
			generateFans(state, 0.5);
			const halfSecondFans = state.currentArtist.fans - initialFans;

			// Reset and generate for 1.0 seconds
			state.currentArtist.fans = initialFans;
			generateFans(state, 1.0);
			const fullSecondFans = state.currentArtist.fans - initialFans;

			expect(fullSecondFans).toBeCloseTo(halfSecondFans * 2, 5);
		});

		it('should update peak fans', () => {
			state.currentArtist.fans = 100;
			state.currentArtist.peakFans = 100;

			generateFans(state, 10.0); // Generate lots of fans

			expect(state.currentArtist.peakFans).toBeGreaterThan(100);
			expect(state.currentArtist.peakFans).toBe(state.currentArtist.fans);
		});
	});

	describe('updatePeakFans()', () => {
		it('should update peak if current exceeds it', () => {
			state.currentArtist.fans = 150;
			state.currentArtist.peakFans = 100;

			updatePeakFans(state);

			expect(state.currentArtist.peakFans).toBe(150);
		});

		it('should not update if current is lower', () => {
			state.currentArtist.fans = 50;
			state.currentArtist.peakFans = 100;

			updatePeakFans(state);

			expect(state.currentArtist.peakFans).toBe(100);
		});

		it('should handle equal values', () => {
			state.currentArtist.fans = 100;
			state.currentArtist.peakFans = 100;

			updatePeakFans(state);

			expect(state.currentArtist.peakFans).toBe(100);
		});
	});

	describe('getFanGrowthRate()', () => {
		it('should return current fan generation rate', () => {
			const rate = getFanGrowthRate(state);
			const calculated = calculateFanGeneration(state);
			expect(rate).toBe(calculated);
		});
	});

	describe('getTimeToReachFans()', () => {
		it('should return 0 if already at target', () => {
			state.currentArtist.fans = 100;
			const time = getTimeToReachFans(state, 100);
			expect(time).toBe(0);
		});

		it('should return 0 if above target', () => {
			state.currentArtist.fans = 150;
			const time = getTimeToReachFans(state, 100);
			expect(time).toBe(0);
		});

		it('should calculate time to reach target', () => {
			state.currentArtist.fans = 100;
			// At 0.1 fans/sec, need 100 more fans = 1000 seconds
			const time = getTimeToReachFans(state, 200);
			expect(time).toBeCloseTo(1000, 0);
		});

		it('should return Infinity if not generating fans', () => {
			state.totalCompletedSongs = 0; // No fan generation
			const time = getTimeToReachFans(state, 200);
			expect(time).toBe(Infinity);
		});
	});

	describe('calculateLegacyFanContribution()', () => {
		it('should return 0 if no legacy artists', () => {
			const contribution = calculateLegacyFanContribution(state);
			expect(contribution).toBe(0);
		});

		it('should calculate cross-promotion from legacy artists', () => {
			state.legacyArtists.push(
				{
					name: 'Legacy 1',
					totalSongs: 50,
					fans: 10000,
					incomeMultiplier: 0.8,
					createdAt: Date.now() - 10000
				},
				{
					name: 'Legacy 2',
					totalSongs: 30,
					fans: 5000,
					incomeMultiplier: 0.8,
					createdAt: Date.now() - 5000
				}
			);

			// 0.001 * (10000 + 5000) = 15 fans/sec from cross-promotion
			const contribution = calculateLegacyFanContribution(state);
			expect(contribution).toBe(15);
		});
	});
});
