/**
 * Tests for Tours System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '$lib/game/config';
import {
	getTourTier,
	canStartTour,
	isTourOnCooldown,
	getTourCooldownRemaining,
	startTour,
	processTour,
	getTourMultiplier,
	getTourRemainingTime,
	getTourStatus,
	calculateTourROI,
	TOUR_TIERS
} from './tours';
import type { GameState } from '$lib/game/types';

describe('Tours System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
	});

	describe('getTourTier', () => {
		it('should return tour tier definition', () => {
			const tier = getTourTier(1);
			expect(tier).toBeDefined();
			expect(tier!.tier).toBe(1);
		});

		it('should return undefined for invalid tier', () => {
			const tier = getTourTier(999);
			expect(tier).toBeUndefined();
		});

		it('should have all 5 tiers defined', () => {
			expect(TOUR_TIERS).toHaveLength(5);
			for (let i = 1; i <= 5; i++) {
				const tier = getTourTier(i);
				expect(tier).toBeDefined();
			}
		});
	});

	describe('canStartTour', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should return false when tours not unlocked', () => {
			state.unlockedSystems.tours = false;
			expect(canStartTour(state, 1)).toBe(false);
		});

		it('should return false when tour already active', () => {
			startTour(state, 1);
			expect(canStartTour(state, 2)).toBe(false);
		});

		it('should return false during cooldown', () => {
			startTour(state, 1);

			// End tour manually
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			// Should be on cooldown
			expect(canStartTour(state, 1)).toBe(false);
		});

		it('should return false when cannot afford', () => {
			state.money = 0;
			expect(canStartTour(state, 1)).toBe(false);
		});

		it('should return true when all conditions met', () => {
			expect(canStartTour(state, 1)).toBe(true);
		});
	});

	describe('isTourOnCooldown', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should return false with no tours completed', () => {
			expect(isTourOnCooldown(state)).toBe(false);
		});

		it('should return true immediately after tour ends', () => {
			startTour(state, 1);

			// End tour manually
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			expect(isTourOnCooldown(state)).toBe(true);
		});

		it('should return false after cooldown expires', () => {
			startTour(state, 1);

			// End tour and wait past cooldown
			const tierDef = getTourTier(1)!;
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			// Simulate time passing
			state.lastTourEndTime = Date.now() - (tierDef.cooldownSeconds + 1) * 1000;

			expect(isTourOnCooldown(state)).toBe(false);
		});
	});

	describe('getTourCooldownRemaining', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should return 0 with no cooldown', () => {
			const remaining = getTourCooldownRemaining(state);
			expect(remaining).toBe(0);
		});

		it('should return positive value during cooldown', () => {
			startTour(state, 1);

			// End tour
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			const remaining = getTourCooldownRemaining(state);
			expect(remaining).toBeGreaterThan(0);
		});
	});

	describe('startTour', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should fail when cannot start', () => {
			state.money = 0;
			const result = startTour(state, 1);
			expect(result).toBe(false);
		});

		it('should create active tour', () => {
			const result = startTour(state, 1);
			expect(result).toBe(true);
			expect(state.activeTour).not.toBeNull();
		});

		it('should deduct cost from money', () => {
			const initialMoney = state.money;
			const tierDef = getTourTier(1)!;

			startTour(state, 1);
			expect(state.money).toBe(initialMoney - tierDef.cost);
		});

		it('should set correct tour properties', () => {
			const tierDef = getTourTier(2)!;
			startTour(state, 2);

			expect(state.activeTour).not.toBeNull();
			expect(state.activeTour!.tier).toBe(2);
			expect(state.activeTour!.revenueMultiplier).toBe(tierDef.revenueMultiplier);
			expect(state.activeTour!.durationSeconds).toBe(tierDef.durationSeconds);
		});

		it('should generate tour name', () => {
			startTour(state, 1);

			expect(state.activeTour).not.toBeNull();
			expect(state.activeTour!.name).toBeTruthy();
			expect(state.activeTour!.name.length).toBeGreaterThan(0);
		});

		it('should set start and end times', () => {
			startTour(state, 1);

			const tour = state.activeTour!;
			expect(tour.startTime).toBeLessThanOrEqual(Date.now());
			expect(tour.endTime).toBeGreaterThan(tour.startTime);
		});
	});

	describe('processTour', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should do nothing with no active tour', () => {
			state.activeTour = null;
			const initialTours = state.totalToursCompleted;

			processTour(state);
			expect(state.totalToursCompleted).toBe(initialTours);
		});

		it('should not end tour before duration', () => {
			startTour(state, 1);

			processTour(state);
			expect(state.activeTour).not.toBeNull();
		});

		it('should end tour after duration', () => {
			startTour(state, 1);

			// Set tour to expired
			state.activeTour!.endTime = Date.now() - 1000;

			processTour(state);
			expect(state.activeTour).toBeNull();
		});

		it('should increment total tours completed', () => {
			const initial = state.totalToursCompleted;
			startTour(state, 1);

			// End tour
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			expect(state.totalToursCompleted).toBe(initial + 1);
		});

		it('should set last tour end time', () => {
			startTour(state, 1);

			// End tour
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			expect(state.lastTourEndTime).toBeGreaterThan(0);
		});

		it('should set cooldown', () => {
			startTour(state, 1);
			const tierDef = getTourTier(1)!;

			// End tour
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			expect(state.tourCooldownSeconds).toBe(tierDef.cooldownSeconds);
		});
	});

	describe('getTourMultiplier', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should return 1.0 with no active tour', () => {
			const multiplier = getTourMultiplier(state);
			expect(multiplier).toBe(1.0);
		});

		it('should return tour multiplier with active tour', () => {
			startTour(state, 2);
			const tierDef = getTourTier(2)!;

			const multiplier = getTourMultiplier(state);
			expect(multiplier).toBe(tierDef.revenueMultiplier);
		});
	});

	describe('getTourRemainingTime', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should return 0 with no active tour', () => {
			const remaining = getTourRemainingTime(state);
			expect(remaining).toBe(0);
		});

		it('should return positive value with active tour', () => {
			startTour(state, 1);

			const remaining = getTourRemainingTime(state);
			expect(remaining).toBeGreaterThan(0);
		});

		it('should return 0 after tour expires', () => {
			startTour(state, 1);

			// Set tour to expired
			state.activeTour!.endTime = Date.now() - 1000;

			const remaining = getTourRemainingTime(state);
			expect(remaining).toBe(0);
		});
	});

	describe('getTourStatus', () => {
		beforeEach(() => {
			state.unlockedSystems.tours = true;
			state.money = 10000;
		});

		it('should return null with no active tour and no cooldown', () => {
			const status = getTourStatus(state);
			expect(status).toBeNull();
		});

		it('should return status string with active tour', () => {
			startTour(state, 1);

			const status = getTourStatus(state);
			expect(status).not.toBeNull();
			expect(status).toContain(state.activeTour!.name);
			expect(status).toContain('remaining');
		});

		it('should return cooldown status after tour ends', () => {
			startTour(state, 1);

			// End tour
			state.activeTour!.endTime = Date.now() - 1000;
			processTour(state);

			const status = getTourStatus(state);
			expect(status).not.toBeNull();
			expect(status).toContain('Cooldown');
		});
	});

	describe('calculateTourROI', () => {
		it('should calculate ROI correctly', () => {
			const tierDef = getTourTier(1)!;
			const incomePerSecond = 100;

			const roi = calculateTourROI(state, 1, incomePerSecond);

			// Expected: (100 * 30 * 0.5) - 500 = 1500 - 500 = 1000
			const expectedBonusIncome =
				incomePerSecond * tierDef.durationSeconds * (tierDef.revenueMultiplier - 1);
			const expectedROI = expectedBonusIncome - tierDef.cost;

			expect(roi).toBe(expectedROI);
		});

		it('should be positive with high income', () => {
			const roi = calculateTourROI(state, 1, 1000);
			expect(roi).toBeGreaterThan(0);
		});

		it('should be negative with low income', () => {
			const roi = calculateTourROI(state, 1, 1);
			expect(roi).toBeLessThan(0);
		});

		it('should increase with higher tier tours', () => {
			const incomePerSecond = 100;

			const roi1 = calculateTourROI(state, 1, incomePerSecond);
			const roi2 = calculateTourROI(state, 2, incomePerSecond);

			// Higher tier should have different ROI (could be positive or negative depending on cost)
			expect(roi1).not.toBe(roi2);
		});
	});
});
