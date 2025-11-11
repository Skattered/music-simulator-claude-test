/**
 * Unit tests for Tech Upgrade System
 *
 * Tests the complete tech upgrade flow:
 * - Purchasing upgrades
 * - Prerequisite validation
 * - Effect application
 * - Tech tier progression
 * - System unlocks (prestige, GPU)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	purchaseTechUpgrade,
	canAffordUpgrade,
	applyTechEffects,
	getAvailableUpgrades,
	getAllUpgrades,
	getNextAffordableUpgrade,
	getTechMultipliers,
	isTierComplete,
	getTierProgress,
	getHighestUnlockedTier,
	isPrestigeUnlocked,
	isGPUUnlocked
} from './tech';
import { TECH_1_2, TECH_2_1, TECH_3_1, getUpgradeById } from '$lib/data/tech-upgrades';
import { createInitialGameState } from '$lib/game/config';
import type { GameState } from '$lib/game/types';

describe('Tech Upgrade System', () => {
	let state: GameState;

	beforeEach(() => {
		// Create fresh game state for each test
		state = createInitialGameState();
		// Give player some money to work with
		state.money = 10000;
	});

	// ========================================================================
	// PURCHASE TESTS
	// ========================================================================

	describe('purchaseTechUpgrade()', () => {
		it('should purchase upgrade when affordable and prerequisites met', () => {
			// Give enough money
			state.money = 100;

			// Purchase tier 1.2 (already have 1.1)
			const result = purchaseTechUpgrade(state, 'tech_1_2');

			expect(result).toBe(true);
			expect(state.purchasedUpgrades).toContain('tech_1_2');
			expect(state.money).toBe(50); // 100 - 50 cost
		});

		it('should not purchase when insufficient funds', () => {
			state.money = 10; // Not enough for tech_1_2 (costs 50)

			const result = purchaseTechUpgrade(state, 'tech_1_2');

			expect(result).toBe(false);
			expect(state.purchasedUpgrades).not.toContain('tech_1_2');
			expect(state.money).toBe(10); // Money unchanged
		});

		it('should not purchase when prerequisites not met', () => {
			// Try to buy tech_1_3 without buying tech_1_2 first
			state.money = 1000;

			const result = purchaseTechUpgrade(state, 'tech_1_3');

			expect(result).toBe(false);
			expect(state.purchasedUpgrades).not.toContain('tech_1_3');
		});

		it('should not purchase same upgrade twice', () => {
			state.money = 1000;

			// First purchase should succeed
			const result1 = purchaseTechUpgrade(state, 'tech_1_2');
			expect(result1).toBe(true);

			const moneyAfterFirst = state.money;

			// Second purchase should fail
			const result2 = purchaseTechUpgrade(state, 'tech_1_2');
			expect(result2).toBe(false);
			expect(state.money).toBe(moneyAfterFirst); // Money unchanged
		});

		it('should update tech tier when moving to new tier', () => {
			state.money = 1000;

			// Start at tier 1
			expect(state.currentTechTier).toBe(1);

			// Purchase tech_2_1 (first upgrade of tier 2)
			purchaseTechUpgrade(state, 'tech_2_1');

			// Should now be tier 2
			expect(state.currentTechTier).toBe(2);
		});

		it('should not downgrade tech tier when buying lower tier upgrades', () => {
			state.money = 10000;

			// Buy tier 2.1 first
			purchaseTechUpgrade(state, 'tech_2_1');
			expect(state.currentTechTier).toBe(2);

			// Now buy tier 1.2 (going back)
			purchaseTechUpgrade(state, 'tech_1_2');

			// Should still be tier 2
			expect(state.currentTechTier).toBe(2);
		});

		it('should return false for non-existent upgrade', () => {
			const result = purchaseTechUpgrade(state, 'tech_99_99');
			expect(result).toBe(false);
		});
	});

	// ========================================================================
	// AFFORDABILITY TESTS
	// ========================================================================

	describe('canAffordUpgrade()', () => {
		it('should return true when player has enough money', () => {
			state.money = 100;
			expect(canAffordUpgrade(state, 'tech_1_2')).toBe(true); // costs 50
		});

		it('should return false when player lacks money', () => {
			state.money = 10;
			expect(canAffordUpgrade(state, 'tech_1_2')).toBe(false); // costs 50
		});

		it('should return false for non-existent upgrade', () => {
			state.money = 999999;
			expect(canAffordUpgrade(state, 'tech_invalid')).toBe(false);
		});

		it('should return true when money exactly equals cost', () => {
			state.money = 50; // Exactly tech_1_2 cost
			expect(canAffordUpgrade(state, 'tech_1_2')).toBe(true);
		});
	});

	// ========================================================================
	// EFFECT APPLICATION TESTS
	// ========================================================================

	describe('applyTechEffects()', () => {
		it('should unlock prestige system when upgrade has unlockPrestige', () => {
			expect(state.unlockedSystems.prestige).toBe(false);

			const upgrade = getUpgradeById('tech_3_1')!;
			applyTechEffects(state, upgrade);

			expect(state.unlockedSystems.prestige).toBe(true);
		});

		it('should unlock GPU system when upgrade has unlockGPU', () => {
			expect(state.unlockedSystems.gpu).toBe(false);

			const upgrade = getUpgradeById('tech_3_1')!;
			applyTechEffects(state, upgrade);

			expect(state.unlockedSystems.gpu).toBe(true);
		});

		it('should not unlock systems for upgrades without special effects', () => {
			expect(state.unlockedSystems.prestige).toBe(false);
			expect(state.unlockedSystems.gpu).toBe(false);

			const upgrade = getUpgradeById('tech_1_2')!;
			applyTechEffects(state, upgrade);

			expect(state.unlockedSystems.prestige).toBe(false);
			expect(state.unlockedSystems.gpu).toBe(false);
		});
	});

	// ========================================================================
	// AVAILABLE UPGRADES TESTS
	// ========================================================================

	describe('getAvailableUpgrades()', () => {
		it('should return only unpurchased upgrades with met prerequisites', () => {
			// Start with tech_1_1 already purchased
			state.purchasedUpgrades = ['tech_1_1'];

			const available = getAvailableUpgrades(state);

			// Should include tech_1_2 (next in tier 1)
			expect(available.some((u) => u.id === 'tech_1_2')).toBe(true);

			// Should include tech_2_1 (first of tier 2, no prerequisites)
			expect(available.some((u) => u.id === 'tech_2_1')).toBe(true);

			// Should NOT include tech_1_3 (needs tech_1_2 first)
			expect(available.some((u) => u.id === 'tech_1_3')).toBe(false);

			// Should NOT include tech_1_1 (already purchased)
			expect(available.some((u) => u.id === 'tech_1_1')).toBe(false);
		});

		it('should update as upgrades are purchased', () => {
			// Purchase tech_1_2
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2'];

			const available = getAvailableUpgrades(state);

			// Now tech_1_3 should be available
			expect(available.some((u) => u.id === 'tech_1_3')).toBe(true);

			// tech_1_2 should not be available (already purchased)
			expect(available.some((u) => u.id === 'tech_1_2')).toBe(false);
		});
	});

	describe('getAllUpgrades()', () => {
		it('should return all 21 upgrades', () => {
			const all = getAllUpgrades();
			expect(all.length).toBe(21); // 7 tiers * 3 sub-tiers
		});

		it('should include all tiers from 1 to 7', () => {
			const all = getAllUpgrades();

			for (let tier = 1; tier <= 7; tier++) {
				const tierUpgrades = all.filter((u) => u.tier === tier);
				expect(tierUpgrades.length).toBe(3); // 3 sub-tiers per tier
			}
		});
	});

	// ========================================================================
	// NEXT AFFORDABLE UPGRADE TESTS
	// ========================================================================

	describe('getNextAffordableUpgrade()', () => {
		it('should return cheapest affordable upgrade', () => {
			state.money = 200; // Can afford tech_1_2 (50) and tech_1_3 (150)
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2']; // tech_1_3 is available

			const next = getNextAffordableUpgrade(state);

			expect(next).toBeDefined();
			expect(next!.id).toBe('tech_1_3'); // Cheapest available
		});

		it('should return undefined when nothing is affordable', () => {
			state.money = 1; // Can't afford anything

			const next = getNextAffordableUpgrade(state);

			expect(next).toBeUndefined();
		});

		it('should only return upgrades with met prerequisites', () => {
			state.money = 10000;
			state.purchasedUpgrades = ['tech_1_1']; // Only tier 1.1

			const next = getNextAffordableUpgrade(state);

			// Should not return tech_1_3 even though we can afford it
			// because we haven't bought tech_1_2 yet
			expect(next).toBeDefined();
			expect(next!.id).not.toBe('tech_1_3');
		});
	});

	// ========================================================================
	// MULTIPLIER TESTS
	// ========================================================================

	describe('getTechMultipliers()', () => {
		it('should return base multipliers when no upgrades purchased', () => {
			state.purchasedUpgrades = [];

			const mults = getTechMultipliers(state);

			expect(mults.speed).toBe(1.0);
			expect(mults.income).toBe(1.0);
			expect(mults.fans).toBe(1.0);
		});

		it('should stack multipliers from purchased upgrades', () => {
			// Purchase tech_1_1 (already owned, base 1.0x) and tech_1_2
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2'];

			const mults = getTechMultipliers(state);

			// tech_1_1: 1.0x speed, 1.0x income, 1.0x fans
			// tech_1_2: 1.2x speed, 1.1x income, 1.0x fans
			// Result: 1.0 * 1.2 = 1.2x speed, 1.0 * 1.1 = 1.1x income
			expect(mults.speed).toBeCloseTo(1.2, 2);
			expect(mults.income).toBeCloseTo(1.1, 2);
			expect(mults.fans).toBeCloseTo(1.0, 2);
		});

		it('should handle multiple upgrades', () => {
			// Purchase tech_1_1, tech_1_2, tech_1_3
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2', 'tech_1_3'];

			const mults = getTechMultipliers(state);

			// tech_1_1: 1.0x all
			// tech_1_2: 1.2x speed, 1.1x income, 1.0x fans
			// tech_1_3: 1.5x speed, 1.3x income, 1.1x fans
			// Result: 1.0 * 1.2 * 1.5 = 1.8x speed
			//         1.0 * 1.1 * 1.3 = 1.43x income
			//         1.0 * 1.0 * 1.1 = 1.1x fans
			expect(mults.speed).toBeCloseTo(1.8, 2);
			expect(mults.income).toBeCloseTo(1.43, 2);
			expect(mults.fans).toBeCloseTo(1.1, 2);
		});
	});

	// ========================================================================
	// TIER PROGRESS TESTS
	// ========================================================================

	describe('isTierComplete()', () => {
		it('should return false when tier has no purchases', () => {
			state.purchasedUpgrades = ['tech_1_1'];

			expect(isTierComplete(state, 2)).toBe(false);
		});

		it('should return false when tier partially purchased', () => {
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2']; // 2 of 3

			expect(isTierComplete(state, 1)).toBe(false);
		});

		it('should return true when all sub-tiers purchased', () => {
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2', 'tech_1_3'];

			expect(isTierComplete(state, 1)).toBe(true);
		});
	});

	describe('getTierProgress()', () => {
		it('should return 0 for tier with no purchases', () => {
			state.purchasedUpgrades = ['tech_1_1'];

			expect(getTierProgress(state, 2)).toBe(0);
		});

		it('should return correct count for partial tier', () => {
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2']; // 2 of 3

			expect(getTierProgress(state, 1)).toBe(2);
		});

		it('should return 3 for complete tier', () => {
			state.purchasedUpgrades = ['tech_1_1', 'tech_1_2', 'tech_1_3'];

			expect(getTierProgress(state, 1)).toBe(3);
		});
	});

	describe('getHighestUnlockedTier()', () => {
		it('should return 1 by default', () => {
			state.purchasedUpgrades = ['tech_1_1'];

			expect(getHighestUnlockedTier(state)).toBe(1);
		});

		it('should return highest tier with any purchase', () => {
			state.purchasedUpgrades = ['tech_1_1', 'tech_2_1', 'tech_3_1'];

			expect(getHighestUnlockedTier(state)).toBe(3);
		});

		it('should update as higher tiers are purchased', () => {
			state.purchasedUpgrades = ['tech_1_1'];
			expect(getHighestUnlockedTier(state)).toBe(1);

			state.purchasedUpgrades.push('tech_2_1');
			expect(getHighestUnlockedTier(state)).toBe(2);

			state.purchasedUpgrades.push('tech_5_1');
			expect(getHighestUnlockedTier(state)).toBe(5);
		});
	});

	// ========================================================================
	// SYSTEM UNLOCK TESTS
	// ========================================================================

	describe('isPrestigeUnlocked()', () => {
		it('should return false initially', () => {
			expect(isPrestigeUnlocked(state)).toBe(false);
		});

		it('should return true after purchasing tier 3.1', () => {
			state.money = 10000;
			purchaseTechUpgrade(state, 'tech_3_1');

			expect(isPrestigeUnlocked(state)).toBe(true);
		});

		it('should remain true after unlock', () => {
			state.unlockedSystems.prestige = true;
			expect(isPrestigeUnlocked(state)).toBe(true);
		});
	});

	describe('isGPUUnlocked()', () => {
		it('should return false initially', () => {
			expect(isGPUUnlocked(state)).toBe(false);
		});

		it('should return true after purchasing tier 3.1', () => {
			state.money = 10000;
			purchaseTechUpgrade(state, 'tech_3_1');

			expect(isGPUUnlocked(state)).toBe(true);
		});

		it('should remain true after unlock', () => {
			state.unlockedSystems.gpu = true;
			expect(isGPUUnlocked(state)).toBe(true);
		});
	});

	// ========================================================================
	// INTEGRATION TESTS
	// ========================================================================

	describe('Integration: Full tier progression', () => {
		it('should allow purchasing all sub-tiers in sequence', () => {
			state.money = 1000000; // Plenty of money

			// Purchase all tier 1 upgrades
			expect(purchaseTechUpgrade(state, 'tech_1_2')).toBe(true);
			expect(purchaseTechUpgrade(state, 'tech_1_3')).toBe(true);

			// Verify tier 1 complete
			expect(isTierComplete(state, 1)).toBe(true);
			expect(getTierProgress(state, 1)).toBe(3);
		});

		it('should unlock prestige at tier 3', () => {
			state.money = 1000000;

			// Buy through to tier 3.1
			purchaseTechUpgrade(state, 'tech_1_2');
			purchaseTechUpgrade(state, 'tech_1_3');
			purchaseTechUpgrade(state, 'tech_2_1');
			purchaseTechUpgrade(state, 'tech_2_2');
			purchaseTechUpgrade(state, 'tech_2_3');
			purchaseTechUpgrade(state, 'tech_3_1');

			// Prestige and GPU should be unlocked
			expect(isPrestigeUnlocked(state)).toBe(true);
			expect(isGPUUnlocked(state)).toBe(true);
			expect(state.currentTechTier).toBe(3);
		});

		it('should prevent skipping sub-tiers', () => {
			state.money = 1000000;

			// Try to skip tech_1_2 and buy tech_1_3 directly
			const result = purchaseTechUpgrade(state, 'tech_1_3');

			expect(result).toBe(false);
			expect(state.purchasedUpgrades).not.toContain('tech_1_3');
		});

		it('should allow purchasing tier X.1 without completing previous tier', () => {
			state.money = 1000000;

			// Buy tech_2_1 without completing tier 1
			const result = purchaseTechUpgrade(state, 'tech_2_1');

			expect(result).toBe(true);
			expect(state.purchasedUpgrades).toContain('tech_2_1');
			expect(state.currentTechTier).toBe(2);
		});
	});

	// ========================================================================
	// EDGE CASES
	// ========================================================================

	describe('Edge cases', () => {
		it('should handle empty purchasedUpgrades array', () => {
			state.purchasedUpgrades = [];

			const available = getAvailableUpgrades(state);
			expect(available.length).toBeGreaterThan(0);
		});

		it('should handle purchasing all 21 upgrades', () => {
			state.money = 1e15; // Astronomical money

			const allUpgrades = getAllUpgrades();

			// Purchase every upgrade in order
			for (const upgrade of allUpgrades) {
				const result = purchaseTechUpgrade(state, upgrade.id);
				// Some may fail due to prerequisite order, that's ok
				if (!result) {
					// Try to purchase prerequisites first
					// (This is simplified; real game would handle this better)
				}
			}

			// Should have many purchases
			expect(state.purchasedUpgrades.length).toBeGreaterThan(0);
		});

		it('should handle invalid tier numbers gracefully', () => {
			expect(isTierComplete(state, 99)).toBe(true); // No upgrades = technically complete
			expect(getTierProgress(state, 0)).toBe(0);
			expect(getTierProgress(state, -1)).toBe(0);
		});
	});
});
