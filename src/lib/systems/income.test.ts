/**
 * Unit tests for Income System
 *
 * Tests streaming income, multipliers, and balance rules
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	generateIncome,
	calculateTotalIncome,
	calculateStreamingIncome,
	calculatePlatformMultiplier,
	applyTourMultiplier,
	applyIncomeBoosts,
	getIncomeBreakdown
} from './income';
import { createInitialGameState } from '$lib/game/config';
import type { GameState } from '$lib/game/types';

describe('Income System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
		state.totalCompletedSongs = 10;
		state.currentArtist.fans = 100;
	});

	describe('calculateStreamingIncome()', () => {
		it('should calculate streaming income from formula', () => {
			// Formula: songs * fans * BASE_STREAMING_RATE * platform * tech * experience
			// 10 songs * 100 fans * 0.001 * 1.0 * 1.0 * 1.0 = 1.0 per second
			const income = calculateStreamingIncome(state);
			expect(income).toBe(1.0);
		});

		it('should scale linearly with songs', () => {
			state.totalCompletedSongs = 20;
			const income = calculateStreamingIncome(state);
			expect(income).toBe(2.0); // Double songs = double income
		});

		it('should scale linearly with fans', () => {
			state.currentArtist.fans = 200;
			const income = calculateStreamingIncome(state);
			expect(income).toBe(2.0); // Double fans = double income
		});

		it('should apply tech tier multiplier', () => {
			state.currentTechTier = 3; // 2.5x multiplier
			const income = calculateStreamingIncome(state);
			expect(income).toBe(2.5);
		});

		it('should apply experience multiplier', () => {
			state.experienceMultiplier = 1.5;
			const income = calculateStreamingIncome(state);
			expect(income).toBe(1.5);
		});

		it('should apply platform multiplier if owned', () => {
			state.ownedPlatforms.push('streaming_platform');
			const income = calculateStreamingIncome(state);
			expect(income).toBe(1.5); // 50% boost
		});

		it('should return 0 if no songs or fans', () => {
			state.totalCompletedSongs = 0;
			expect(calculateStreamingIncome(state)).toBe(0);

			state.totalCompletedSongs = 10;
			state.currentArtist.fans = 0;
			expect(calculateStreamingIncome(state)).toBe(0);
		});
	});

	describe('calculatePlatformMultiplier()', () => {
		it('should return 1.0 by default', () => {
			expect(calculatePlatformMultiplier(state)).toBe(1.0);
		});

		it('should return 1.5 if owns streaming platform', () => {
			state.ownedPlatforms.push('streaming_platform');
			expect(calculatePlatformMultiplier(state)).toBe(1.5);
		});
	});

	describe('applyTourMultiplier()', () => {
		it('should return base income if no active tour', () => {
			const income = applyTourMultiplier(state, 100);
			expect(income).toBe(100);
		});

		it('should apply tour multiplier if tour active', () => {
			state.activeTour = {
				id: 'tour1',
				name: 'Test Tour',
				tier: 1,
				startTime: Date.now() - 1000,
				endTime: Date.now() + 10000,
				durationSeconds: 11,
				revenueMultiplier: 2.0,
				cost: 1000
			};

			const income = applyTourMultiplier(state, 100);
			expect(income).toBe(200); // 2x multiplier
		});

		it('should not apply multiplier if tour expired', () => {
			state.activeTour = {
				id: 'tour1',
				name: 'Test Tour',
				tier: 1,
				startTime: Date.now() - 20000,
				endTime: Date.now() - 1000, // Expired
				durationSeconds: 19,
				revenueMultiplier: 2.0,
				cost: 1000
			};

			const income = applyTourMultiplier(state, 100);
			expect(income).toBe(100); // No multiplier
		});
	});

	describe('applyIncomeBoosts()', () => {
		it('should return base income if no boosts', () => {
			const income = applyIncomeBoosts(state, 100);
			expect(income).toBe(100);
		});

		it('should apply active income boosts', () => {
			state.activeBoosts.push({
				abilityId: 'bot_streams',
				name: 'Bot Streams',
				multiplier: 1.5,
				expiresAt: Date.now() + 10000,
				type: 'income'
			});

			const income = applyIncomeBoosts(state, 100);
			expect(income).toBe(150);
		});

		it('should stack multiple boosts multiplicatively', () => {
			state.activeBoosts.push(
				{
					abilityId: 'boost1',
					name: 'Boost 1',
					multiplier: 1.5,
					expiresAt: Date.now() + 10000,
					type: 'income'
				},
				{
					abilityId: 'boost2',
					name: 'Boost 2',
					multiplier: 2.0,
					expiresAt: Date.now() + 10000,
					type: 'income'
				}
			);

			const income = applyIncomeBoosts(state, 100);
			expect(income).toBe(300); // 1.5 * 2.0 = 3.0x
		});

		it('should ignore expired boosts', () => {
			state.activeBoosts.push({
				abilityId: 'expired',
				name: 'Expired Boost',
				multiplier: 2.0,
				expiresAt: Date.now() - 1000, // Expired
				type: 'income'
			});

			const income = applyIncomeBoosts(state, 100);
			expect(income).toBe(100);
		});

		it('should ignore non-income boosts', () => {
			state.activeBoosts.push({
				abilityId: 'fan_boost',
				name: 'Fan Boost',
				multiplier: 2.0,
				expiresAt: Date.now() + 10000,
				type: 'fans' // Not income
			});

			const income = applyIncomeBoosts(state, 100);
			expect(income).toBe(100);
		});
	});

	describe('generateIncome()', () => {
		it('should add income to money', () => {
			const initialMoney = state.money;
			generateIncome(state, 1.0); // 1 second

			expect(state.money).toBeGreaterThan(initialMoney);
		});

		it('should scale income by deltaTime', () => {
			const initialMoney = state.money;

			// Generate for 0.5 seconds
			generateIncome(state, 0.5);
			const halfSecondIncome = state.money - initialMoney;

			// Reset and generate for 1.0 seconds
			state.money = initialMoney;
			generateIncome(state, 1.0);
			const fullSecondIncome = state.money - initialMoney;

			expect(fullSecondIncome).toBeCloseTo(halfSecondIncome * 2, 5);
		});
	});

	describe('calculateTotalIncome()', () => {
		it('should return streaming income', () => {
			const total = calculateTotalIncome(state);
			const streaming = calculateStreamingIncome(state);
			expect(total).toBe(streaming);
		});

		it('should apply tour multiplier to total', () => {
			state.activeTour = {
				id: 'tour1',
				name: 'Test Tour',
				tier: 1,
				startTime: Date.now(),
				endTime: Date.now() + 10000,
				durationSeconds: 10,
				revenueMultiplier: 2.0,
				cost: 1000
			};

			const total = calculateTotalIncome(state);
			const streaming = calculateStreamingIncome(state);
			expect(total).toBe(streaming * 2.0);
		});
	});

	describe('getIncomeBreakdown()', () => {
		it('should return breakdown of income sources', () => {
			const breakdown = getIncomeBreakdown(state);

			expect(breakdown.streaming).toBeGreaterThan(0);
			expect(breakdown.total).toBe(breakdown.streaming); // Only streaming for now
			expect(breakdown.streamingPercentage).toBe(1.0); // 100% streaming
		});

		it('should calculate streaming percentage', () => {
			const breakdown = getIncomeBreakdown(state);
			expect(breakdown.streamingPercentage).toBeGreaterThanOrEqual(0);
			expect(breakdown.streamingPercentage).toBeLessThanOrEqual(1);
		});
	});
});
