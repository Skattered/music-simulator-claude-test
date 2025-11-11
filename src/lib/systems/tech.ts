/**
 * Music Industry Simulator - Tech Upgrade System
 *
 * Manages tech tier progression and upgrade purchases.
 * Players purchase upgrades to improve generation speed, income, and unlock features.
 *
 * KEY MECHANICS:
 * - 7 tech tiers, each with 3 sub-tiers (21 total upgrades)
 * - Sub-tiers must be purchased in order (1 → 2 → 3)
 * - Prestige unlocks at tiers 3, 5, 6, 7
 * - Effects stack multiplicatively with previous upgrades
 * - Tech tier determines generation speed and song cost
 *
 * PURCHASE FLOW:
 * 1. Check if player can afford upgrade
 * 2. Check if prerequisites are met (previous sub-tier purchased)
 * 3. Deduct cost from money
 * 4. Add upgrade ID to purchasedUpgrades array
 * 5. Apply effects to game state
 * 6. Update current tech tier if moving to new tier
 */

import type { GameState, TechUpgrade } from '$lib/game/types';
import {
	ALL_TECH_UPGRADES,
	getUpgradeById,
	getUpgradesByTier,
	canPurchaseUpgrade as canPurchaseUpgradeHelper
} from '$lib/data/tech-upgrades';

/**
 * Purchase a tech upgrade
 *
 * Handles the complete purchase flow:
 * 1. Validates upgrade exists and can be purchased
 * 2. Checks if player has enough money
 * 3. Deducts cost and marks as purchased
 * 4. Applies all effects to game state
 * 5. Updates current tech tier if necessary
 *
 * @param state - Current game state (mutated)
 * @param upgradeId - ID of upgrade to purchase
 * @returns True if purchase successful, false otherwise
 *
 * @example
 * ```typescript
 * if (purchaseTechUpgrade(state, 'tech_3_1')) {
 *   console.log('Purchased Local AI Models!');
 * }
 * ```
 */
export function purchaseTechUpgrade(state: GameState, upgradeId: string): boolean {
	// Get upgrade definition
	const upgrade = getUpgradeById(upgradeId);
	if (!upgrade) {
		console.warn(`[Tech] Upgrade not found: ${upgradeId}`);
		return false;
	}

	// Check if can afford
	if (!canAffordUpgrade(state, upgradeId)) {
		return false;
	}

	// Check prerequisites (previous sub-tier purchased)
	if (!canPurchaseUpgradeHelper(upgrade, state.purchasedUpgrades)) {
		console.warn(`[Tech] Prerequisites not met for ${upgradeId}`);
		return false;
	}

	// Already purchased?
	if (state.purchasedUpgrades.includes(upgradeId)) {
		console.warn(`[Tech] Already purchased: ${upgradeId}`);
		return false;
	}

	// Deduct cost
	state.money -= upgrade.cost;

	// Mark as purchased
	state.purchasedUpgrades.push(upgradeId);

	// Apply effects
	applyTechEffects(state, upgrade);

	// Update current tech tier if moving to a new tier
	if (upgrade.tier > state.currentTechTier) {
		state.currentTechTier = upgrade.tier;
	}

	console.log(`[Tech] Purchased ${upgrade.name} (${upgradeId})`);
	return true;
}

/**
 * Check if player can afford an upgrade
 *
 * @param state - Current game state
 * @param upgradeId - ID of upgrade to check
 * @returns True if player has enough money
 *
 * @example
 * ```typescript
 * if (canAffordUpgrade(state, 'tech_2_1')) {
 *   // Show purchase button enabled
 * }
 * ```
 */
export function canAffordUpgrade(state: GameState, upgradeId: string): boolean {
	const upgrade = getUpgradeById(upgradeId);
	if (!upgrade) {
		return false;
	}

	return state.money >= upgrade.cost;
}

/**
 * Apply tech upgrade effects to game state
 *
 * Applies all effects from the upgrade:
 * - Generation speed multiplier
 * - Income multiplier
 * - Fan multiplier
 * - System unlocks (prestige, GPU, etc.)
 *
 * NOTE: Multipliers are applied globally, not per-upgrade.
 * The game config's getTechTier() already factors in the current tier's multipliers.
 *
 * @param state - Current game state (mutated)
 * @param upgrade - Upgrade whose effects to apply
 *
 * @example
 * ```typescript
 * applyTechEffects(state, TECH_3_1);
 * // state.unlockedSystems.prestige is now true
 * // state.unlockedSystems.gpu is now true
 * ```
 */
export function applyTechEffects(state: GameState, upgrade: TechUpgrade): void {
	const { effects } = upgrade;

	// Unlock prestige system
	if (effects.unlockPrestige) {
		state.unlockedSystems.prestige = true;
		console.log('[Tech] Prestige system unlocked!');
	}

	// Unlock GPU resource system
	if (effects.unlockGPU) {
		state.unlockedSystems.gpu = true;
		console.log('[Tech] GPU system unlocked!');
	}

	// NOTE: Generation speed, income, and fan multipliers are handled
	// by the tech tier system in config.ts. When we update currentTechTier,
	// those multipliers automatically apply through getTechTier().
	//
	// Individual upgrade multipliers are already baked into the tier definitions
	// in config.ts (TECH_TIER_1 through TECH_TIER_7).
}

/**
 * Get all purchasable upgrades for current state
 *
 * Returns upgrades that:
 * 1. Haven't been purchased yet
 * 2. Meet prerequisite requirements
 *
 * @param state - Current game state
 * @returns Array of purchasable upgrades
 *
 * @example
 * ```typescript
 * const available = getAvailableUpgrades(state);
 * // Returns only upgrades player can currently purchase
 * ```
 */
export function getAvailableUpgrades(state: GameState): TechUpgrade[] {
	return ALL_TECH_UPGRADES.filter((upgrade) => {
		// Skip already purchased
		if (state.purchasedUpgrades.includes(upgrade.id)) {
			return false;
		}

		// Check prerequisites
		return canPurchaseUpgradeHelper(upgrade, state.purchasedUpgrades);
	});
}

/**
 * Get all upgrades (for UI display)
 *
 * @returns All tech upgrades
 */
export function getAllUpgrades(): TechUpgrade[] {
	return ALL_TECH_UPGRADES;
}

/**
 * Get next affordable upgrade
 *
 * Returns the cheapest upgrade player can afford right now.
 * Useful for "Max" buttons or AI decision making.
 *
 * @param state - Current game state
 * @returns Next affordable upgrade or undefined
 *
 * @example
 * ```typescript
 * const next = getNextAffordableUpgrade(state);
 * if (next) {
 *   purchaseTechUpgrade(state, next.id);
 * }
 * ```
 */
export function getNextAffordableUpgrade(state: GameState): TechUpgrade | undefined {
	const available = getAvailableUpgrades(state);

	// Filter by affordability
	const affordable = available.filter((upgrade) => state.money >= upgrade.cost);

	// Sort by cost ascending
	affordable.sort((a, b) => a.cost - b.cost);

	return affordable[0];
}

/**
 * Calculate total tech multipliers from all purchased upgrades
 *
 * Returns cumulative multipliers for:
 * - Generation speed
 * - Income per song
 * - Fan generation
 *
 * NOTE: In practice, we use the tech tier system from config.ts,
 * but this function is useful for detailed breakdowns in UI.
 *
 * @param state - Current game state
 * @returns Object with multipliers
 *
 * @example
 * ```typescript
 * const mults = getTechMultipliers(state);
 * console.log(`Speed: ${mults.speed}x`);
 * console.log(`Income: ${mults.income}x`);
 * console.log(`Fans: ${mults.fans}x`);
 * ```
 */
export function getTechMultipliers(state: GameState): {
	speed: number;
	income: number;
	fans: number;
} {
	let speedMult = 1.0;
	let incomeMult = 1.0;
	let fanMult = 1.0;

	// Iterate through purchased upgrades
	for (const upgradeId of state.purchasedUpgrades) {
		const upgrade = getUpgradeById(upgradeId);
		if (!upgrade) continue;

		const { effects } = upgrade;

		// Multiply (stack multiplicatively)
		if (effects.generationSpeedMultiplier) {
			speedMult *= effects.generationSpeedMultiplier;
		}
		if (effects.incomeMultiplier) {
			incomeMult *= effects.incomeMultiplier;
		}
		if (effects.fanMultiplier) {
			fanMult *= effects.fanMultiplier;
		}
	}

	return {
		speed: speedMult,
		income: incomeMult,
		fans: fanMult
	};
}

/**
 * Check if all sub-tiers in a tier are purchased
 *
 * @param state - Current game state
 * @param tier - Tier number (1-7)
 * @returns True if all sub-tiers purchased
 *
 * @example
 * ```typescript
 * if (isTierComplete(state, 3)) {
 *   console.log('Tier 3 fully upgraded!');
 * }
 * ```
 */
export function isTierComplete(state: GameState, tier: number): boolean {
	const tierUpgrades = getUpgradesByTier(tier);

	// Check if all upgrades in tier are purchased
	return tierUpgrades.every((upgrade) => state.purchasedUpgrades.includes(upgrade.id));
}

/**
 * Get progress in current tier (0-3 sub-tiers purchased)
 *
 * @param state - Current game state
 * @param tier - Tier number (1-7)
 * @returns Number of sub-tiers purchased (0-3)
 *
 * @example
 * ```typescript
 * const progress = getTierProgress(state, 3);
 * console.log(`Tier 3: ${progress}/3 upgrades`);
 * ```
 */
export function getTierProgress(state: GameState, tier: number): number {
	const tierUpgrades = getUpgradesByTier(tier);

	return tierUpgrades.filter((upgrade) => state.purchasedUpgrades.includes(upgrade.id)).length;
}

/**
 * Get the highest unlocked tech tier
 *
 * Returns the highest tier where at least one upgrade is purchased.
 * This is different from currentTechTier which only updates when
 * moving to a new tier.
 *
 * @param state - Current game state
 * @returns Highest tier with purchases (1-7)
 *
 * @example
 * ```typescript
 * const highest = getHighestUnlockedTier(state);
 * console.log(`Highest tier: ${highest}`);
 * ```
 */
export function getHighestUnlockedTier(state: GameState): number {
	let highest = 1; // Always have tier 1.1

	for (const upgradeId of state.purchasedUpgrades) {
		const upgrade = getUpgradeById(upgradeId);
		if (upgrade && upgrade.tier > highest) {
			highest = upgrade.tier;
		}
	}

	return highest;
}

/**
 * Check if prestige is unlocked via tech upgrades
 *
 * Prestige unlocks at tiers 3, 5, 6, 7 (when you buy the .1 upgrade)
 *
 * @param state - Current game state
 * @returns True if prestige is unlocked
 */
export function isPrestigeUnlocked(state: GameState): boolean {
	return state.unlockedSystems.prestige;
}

/**
 * Check if GPU system is unlocked via tech upgrades
 *
 * GPU unlocks at tier 3.1 (Local AI Models)
 *
 * @param state - Current game state
 * @returns True if GPU system is unlocked
 */
export function isGPUUnlocked(state: GameState): boolean {
	return state.unlockedSystems.gpu;
}
