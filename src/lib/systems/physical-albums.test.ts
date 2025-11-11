/**
 * Tests for Physical Albums System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '$lib/game/config';
import {
	canPressAlbum,
	pressAlbum,
	calculatePressCost,
	calculateDemand,
	processAlbumSales,
	calculatePotentialRevenue,
	calculateNetProfit,
	getAlbumStatus,
	BASE_PRESS_COST,
	BASE_COPIES,
	BASE_PRICE_PER_COPY
} from './physical-albums';
import type { GameState } from '$lib/game/types';

describe('Physical Albums System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
	});

	describe('calculatePressCost', () => {
		it('should calculate cost correctly', () => {
			const cost = calculatePressCost(100);
			expect(cost).toBe(100 * BASE_PRESS_COST);
		});

		it('should scale with copies', () => {
			const cost1 = calculatePressCost(100);
			const cost2 = calculatePressCost(200);
			expect(cost2).toBe(cost1 * 2);
		});
	});

	describe('canPressAlbum', () => {
		beforeEach(() => {
			state.unlockedSystems.physicalAlbums = true;
		});

		it('should return false when system not unlocked', () => {
			state.unlockedSystems.physicalAlbums = false;
			expect(canPressAlbum(state)).toBe(false);
		});

		it('should return false when cannot afford', () => {
			state.money = 0;
			expect(canPressAlbum(state, BASE_COPIES)).toBe(false);
		});

		it('should return true when can afford', () => {
			state.money = 10000;
			expect(canPressAlbum(state, BASE_COPIES)).toBe(true);
		});
	});

	describe('pressAlbum', () => {
		beforeEach(() => {
			state.unlockedSystems.physicalAlbums = true;
			state.money = 10000;
		});

		it('should fail when cannot press', () => {
			state.money = 0;
			const result = pressAlbum(state);
			expect(result).toBe(false);
		});

		it('should create album batch', () => {
			const result = pressAlbum(state, BASE_COPIES, BASE_PRICE_PER_COPY);
			expect(result).toBe(true);
			expect(state.activeAlbumBatch).not.toBeNull();
		});

		it('should deduct cost from money', () => {
			const initialMoney = state.money;
			const cost = calculatePressCost(BASE_COPIES);

			pressAlbum(state, BASE_COPIES);
			expect(state.money).toBe(initialMoney - cost);
		});

		it('should set correct album properties', () => {
			pressAlbum(state, 100, 15);

			expect(state.activeAlbumBatch).not.toBeNull();
			expect(state.activeAlbumBatch!.copiesPressed).toBe(100);
			expect(state.activeAlbumBatch!.copiesRemaining).toBe(100);
			expect(state.activeAlbumBatch!.pricePerCopy).toBe(15);
			expect(state.activeAlbumBatch!.revenueGenerated).toBe(0);
		});

		it('should generate album name', () => {
			pressAlbum(state);

			expect(state.activeAlbumBatch).not.toBeNull();
			expect(state.activeAlbumBatch!.name).toBeTruthy();
			expect(state.activeAlbumBatch!.name.length).toBeGreaterThan(0);
		});

		it('should increment total albums released', () => {
			const initial = state.totalAlbumsReleased;
			pressAlbum(state);
			expect(state.totalAlbumsReleased).toBe(initial + 1);
		});

		it('should replace existing active album', () => {
			pressAlbum(state, 100, 10);
			const firstAlbumId = state.activeAlbumBatch!.id;

			pressAlbum(state, 200, 20);
			const secondAlbumId = state.activeAlbumBatch!.id;

			expect(secondAlbumId).not.toBe(firstAlbumId);
			expect(state.activeAlbumBatch!.copiesPressed).toBe(200);
		});
	});

	describe('calculateDemand', () => {
		it('should start at 100% demand', () => {
			state.unlockedSystems.physicalAlbums = true;
			state.money = 10000;
			pressAlbum(state);

			const album = state.activeAlbumBatch!;
			const demand = calculateDemand(album);

			expect(demand).toBeCloseTo(1.0, 2);
		});

		it('should decay over time', () => {
			state.unlockedSystems.physicalAlbums = true;
			state.money = 10000;
			pressAlbum(state);

			const album = state.activeAlbumBatch!;

			// Simulate aging
			album.pressTimestamp = Date.now() - 3600 * 1000; // 1 hour ago

			const demand = calculateDemand(album);
			expect(demand).toBeLessThan(1.0);
			expect(demand).toBeGreaterThan(0);
		});

		it('should never go below 0', () => {
			state.unlockedSystems.physicalAlbums = true;
			state.money = 10000;
			pressAlbum(state);

			const album = state.activeAlbumBatch!;

			// Simulate very old album
			album.pressTimestamp = Date.now() - 86400 * 1000; // 1 day ago

			const demand = calculateDemand(album);
			expect(demand).toBeGreaterThanOrEqual(0);
		});
	});

	describe('processAlbumSales', () => {
		beforeEach(() => {
			state.unlockedSystems.physicalAlbums = true;
			state.money = 10000;
		});

		it('should do nothing with no active album', () => {
			state.activeAlbumBatch = null;
			const initialMoney = state.money;

			processAlbumSales(state, 1.0);
			expect(state.money).toBe(initialMoney);
		});

		it('should sell copies and generate revenue', () => {
			pressAlbum(state, 100, 15);
			const initialMoney = state.money;
			const initialCopies = state.activeAlbumBatch!.copiesRemaining;

			processAlbumSales(state, 1.0);

			expect(state.money).toBeGreaterThan(initialMoney);
			expect(state.activeAlbumBatch!.copiesRemaining).toBeLessThan(initialCopies);
		});

		it('should track revenue generated', () => {
			pressAlbum(state, 100, 15);

			processAlbumSales(state, 1.0);

			expect(state.activeAlbumBatch!.revenueGenerated).toBeGreaterThan(0);
		});

		it('should clear album when sold out', () => {
			pressAlbum(state, 1, 15); // Only 1 copy

			// Process enough to sell all copies
			for (let i = 0; i < 10; i++) {
				processAlbumSales(state, 1.0);
			}

			expect(state.activeAlbumBatch).toBeNull();
		});

		it('should scale sales by delta time', () => {
			pressAlbum(state, 100, 15);
			const album1 = state.activeAlbumBatch!;

			processAlbumSales(state, 0.5);
			const soldInHalfSecond = album1.copiesPressed - album1.copiesRemaining;

			// Reset
			pressAlbum(state, 100, 15);
			const album2 = state.activeAlbumBatch!;

			processAlbumSales(state, 1.0);
			const soldInOneSecond = album2.copiesPressed - album2.copiesRemaining;

			// Should sell roughly twice as much in 1 second vs 0.5 seconds
			expect(soldInOneSecond).toBeGreaterThan(soldInHalfSecond);
		});
	});

	describe('calculatePotentialRevenue', () => {
		it('should calculate potential revenue correctly', () => {
			const revenue = calculatePotentialRevenue(100, 15);
			expect(revenue).toBe(1500);
		});

		it('should scale with copies and price', () => {
			const revenue1 = calculatePotentialRevenue(100, 15);
			const revenue2 = calculatePotentialRevenue(200, 15);
			const revenue3 = calculatePotentialRevenue(100, 30);

			expect(revenue2).toBe(revenue1 * 2);
			expect(revenue3).toBe(revenue1 * 2);
		});
	});

	describe('calculateNetProfit', () => {
		it('should calculate net profit correctly', () => {
			const profit = calculateNetProfit(100, 15);
			const expectedRevenue = 100 * 15;
			const expectedCost = 100 * BASE_PRESS_COST;
			const expectedProfit = expectedRevenue - expectedCost;

			expect(profit).toBe(expectedProfit);
		});

		it('can be negative if price too low', () => {
			const profit = calculateNetProfit(100, 1);
			expect(profit).toBeLessThan(0);
		});

		it('should be positive with reasonable price', () => {
			const profit = calculateNetProfit(100, 15);
			expect(profit).toBeGreaterThan(0);
		});
	});

	describe('getAlbumStatus', () => {
		beforeEach(() => {
			state.unlockedSystems.physicalAlbums = true;
			state.money = 10000;
		});

		it('should return null with no active album', () => {
			state.activeAlbumBatch = null;
			const status = getAlbumStatus(state);
			expect(status).toBeNull();
		});

		it('should return status string with active album', () => {
			pressAlbum(state, 100, 15);
			const status = getAlbumStatus(state);

			expect(status).not.toBeNull();
			expect(status).toContain(state.activeAlbumBatch!.name);
		});

		it('should show copies sold', () => {
			pressAlbum(state, 100, 15);

			// Sell some copies
			processAlbumSales(state, 1.0);

			const status = getAlbumStatus(state);
			expect(status).toContain('/100');
		});

		it('should show demand percentage', () => {
			pressAlbum(state, 100, 15);
			const status = getAlbumStatus(state);

			expect(status).toContain('Demand:');
			expect(status).toContain('%');
		});
	});
});
