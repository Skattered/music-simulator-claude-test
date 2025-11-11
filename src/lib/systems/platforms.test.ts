/**
 * Tests for Platform Ownership & Industry Control System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '$lib/game/config';
import {
	canPurchasePlatform,
	purchasePlatform,
	getPlatformIncomeMultiplier,
	hasWon,
	getAvailablePlatforms
} from './platforms';
import { ALL_PLATFORMS } from '$lib/data/platforms';
import type { GameState } from '$lib/game/types';

describe('Platform Ownership & Industry Control System', () => {
	let state: GameState;

	beforeEach(() => {
		state = createInitialGameState();
		state.money = 1000000000; // Plenty of money for testing
	});

	describe('canPurchasePlatform', () => {
		it('should return false when cannot afford', () => {
			state.money = 0;
			expect(canPurchasePlatform(state, 'platform_spotify')).toBe(false);
		});

		it('should return true when can afford', () => {
			expect(canPurchasePlatform(state, 'platform_spotify')).toBe(true);
		});

		it('should return false when already owned', () => {
			purchasePlatform(state, 'platform_spotify');
			expect(canPurchasePlatform(state, 'platform_spotify')).toBe(false);
		});
	});

	describe('purchasePlatform', () => {
		it('should add platform to owned list', () => {
			purchasePlatform(state, 'platform_spotify');
			expect(state.ownedPlatforms).toContain('platform_spotify');
		});

		it('should deduct cost from money', () => {
			const initialMoney = state.money;
			const platform = ALL_PLATFORMS[0];

			purchasePlatform(state, platform.id);
			expect(state.money).toBe(initialMoney - platform.cost);
		});

		it('should increase industry control', () => {
			const initialControl = state.industryControl;
			const platform = ALL_PLATFORMS[0];

			purchasePlatform(state, platform.id);
			expect(state.industryControl).toBe(initialControl + platform.controlContribution);
		});

		it('should fail when cannot purchase', () => {
			state.money = 0;
			const result = purchasePlatform(state, 'platform_spotify');
			expect(result).toBe(false);
		});
	});

	describe('getPlatformIncomeMultiplier', () => {
		it('should return 1.0 with no owned platforms', () => {
			const multiplier = getPlatformIncomeMultiplier(state);
			expect(multiplier).toBe(1.0);
		});

		it('should return platform multiplier', () => {
			purchasePlatform(state, 'platform_spotify');
			const multiplier = getPlatformIncomeMultiplier(state);
			expect(multiplier).toBeGreaterThan(1.0);
		});

		it('should multiply multiple platforms', () => {
			purchasePlatform(state, 'platform_spotify');
			const mult1 = getPlatformIncomeMultiplier(state);

			purchasePlatform(state, 'platform_label');
			const mult2 = getPlatformIncomeMultiplier(state);

			expect(mult2).toBeGreaterThan(mult1);
		});
	});

	describe('hasWon', () => {
		it('should return false initially', () => {
			expect(hasWon(state)).toBe(false);
		});

		it('should return true at 100% control', () => {
			state.industryControl = 100;
			expect(hasWon(state)).toBe(true);
		});

		it('should return true above 100% control', () => {
			state.industryControl = 150;
			expect(hasWon(state)).toBe(true);
		});
	});

	describe('getAvailablePlatforms', () => {
		it('should return all platforms initially', () => {
			const available = getAvailablePlatforms(state);
			expect(available.length).toBe(ALL_PLATFORMS.length);
		});

		it('should exclude owned platforms', () => {
			purchasePlatform(state, 'platform_spotify');
			const available = getAvailablePlatforms(state);
			expect(available.length).toBe(ALL_PLATFORMS.length - 1);
		});
	});
});
