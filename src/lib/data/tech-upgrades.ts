/**
 * Music Industry Simulator - Tech Upgrade Definitions
 *
 * Defines all 7 tech tiers with 3 sub-tiers each (21 total upgrades).
 * Each tier represents progression from manual labor to full automation.
 *
 * TECH PROGRESSION:
 * Tier 1: Third-party Web Services (starting tier)
 * Tier 2: Lifetime Licenses/Subscriptions
 * Tier 3: Local AI Models (PRESTIGE UNLOCK #1)
 * Tier 4: Fine-tuned Models
 * Tier 5: Train Your Own Models (PRESTIGE UNLOCK #2)
 * Tier 6: Build Your Own Software (PRESTIGE UNLOCK #3)
 * Tier 7: AI Agent Automation (PRESTIGE UNLOCK #4)
 *
 * Each tier has 3 sub-tiers that improve generation speed, income, and fan generation.
 * Sub-tiers must be purchased in order (1 → 2 → 3).
 */

import type { TechUpgrade } from '$lib/game/types';

// ============================================================================
// TIER 1: THIRD-PARTY WEB SERVICES
// ============================================================================

/**
 * Tier 1.1: Basic Web Services
 * Starting upgrade - already owned
 */
export const TECH_1_1: TechUpgrade = {
	id: 'tech_1_1',
	name: 'Basic Web Services',
	description: 'Use third-party AI APIs to generate songs. Pay per song. Manual and slow.',
	cost: 0, // Already have this
	tier: 1,
	subTier: 1,
	purchased: true, // Player starts with this
	effects: {
		generationSpeedMultiplier: 1.0,
		incomeMultiplier: 1.0,
		fanMultiplier: 1.0
	}
};

/**
 * Tier 1.2: API Caching
 * First upgrade - slightly faster generation
 */
export const TECH_1_2: TechUpgrade = {
	id: 'tech_1_2',
	name: 'API Caching',
	description: 'Cache common responses to speed up generation. Still pay per song, but faster.',
	cost: 50,
	tier: 1,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 1.2, // 20% faster
		incomeMultiplier: 1.1, // 10% more income
		fanMultiplier: 1.0
	}
};

/**
 * Tier 1.3: Batch Processing
 * Tier 1 complete - queue multiple songs
 */
export const TECH_1_3: TechUpgrade = {
	id: 'tech_1_3',
	name: 'Batch Processing',
	description: 'Queue multiple API calls at once. Better throughput, still expensive per song.',
	cost: 150,
	tier: 1,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 1.5, // 50% faster
		incomeMultiplier: 1.3,
		fanMultiplier: 1.1
	}
};

// ============================================================================
// TIER 2: LIFETIME LICENSES/SUBSCRIPTIONS
// ============================================================================

/**
 * Tier 2.1: Lifetime License
 * Major milestone - songs become FREE
 */
export const TECH_2_1: TechUpgrade = {
	id: 'tech_2_1',
	name: 'Lifetime License',
	description: 'Pay once, generate forever. Songs are now FREE! Generation time reduced to ~15s.',
	cost: 500,
	tier: 2,
	subTier: 1,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 2.0, // 2x faster than tier 1.1
		incomeMultiplier: 1.5,
		fanMultiplier: 1.2
	}
};

/**
 * Tier 2.2: Premium Features
 * Better quality, more fans
 */
export const TECH_2_2: TechUpgrade = {
	id: 'tech_2_2',
	name: 'Premium Features',
	description: 'Unlock advanced features. Better song quality attracts more fans.',
	cost: 1000,
	tier: 2,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 2.3,
		incomeMultiplier: 1.8,
		fanMultiplier: 1.4
	}
};

/**
 * Tier 2.3: Priority Queue
 * Fastest tier 2 generation
 */
export const TECH_2_3: TechUpgrade = {
	id: 'tech_2_3',
	name: 'Priority Queue',
	description: 'Jump to the front of the queue. Much faster generation (~10s).',
	cost: 2500,
	tier: 2,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 3.0, // 3x faster than tier 1.1
		incomeMultiplier: 2.0,
		fanMultiplier: 1.5
	}
};

// ============================================================================
// TIER 3: LOCAL AI MODELS
// ============================================================================

/**
 * Tier 3.1: Run Models Locally
 * PRESTIGE UNLOCK #1 - GPU system unlocked
 */
export const TECH_3_1: TechUpgrade = {
	id: 'tech_3_1',
	name: 'Run Models Locally',
	description:
		'Download and run AI models on your own hardware. Complete control. Generation time ~5s. UNLOCKS PRESTIGE & GPU!',
	cost: 5000,
	tier: 3,
	subTier: 1,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 6.0, // 6x faster than tier 1.1
		incomeMultiplier: 2.5,
		fanMultiplier: 1.5,
		unlockPrestige: true, // PRESTIGE UNLOCK #1
		unlockGPU: true // GPU resource system unlocked
	}
};

/**
 * Tier 3.2: GPU Acceleration
 * Leverage GPU for faster generation
 */
export const TECH_3_2: TechUpgrade = {
	id: 'tech_3_2',
	name: 'GPU Acceleration',
	description: 'Leverage GPU for parallel processing. Much faster generation (~3s).',
	cost: 10000,
	tier: 3,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 10.0,
		incomeMultiplier: 3.0,
		fanMultiplier: 1.8
	}
};

/**
 * Tier 3.3: Model Optimization
 * Optimized models for speed
 */
export const TECH_3_3: TechUpgrade = {
	id: 'tech_3_3',
	name: 'Model Optimization',
	description: 'Optimize models for your hardware. Near-instant results (~2s).',
	cost: 25000,
	tier: 3,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 15.0, // 15x faster than tier 1.1
		incomeMultiplier: 3.5,
		fanMultiplier: 2.0
	}
};

// ============================================================================
// TIER 4: FINE-TUNED MODELS
// ============================================================================

/**
 * Tier 4.1: Custom Fine-tuning
 * Train on your own catalog
 */
export const TECH_4_1: TechUpgrade = {
	id: 'tech_4_1',
	name: 'Custom Fine-tuning',
	description: 'Fine-tune models on your own catalog. Unique sound. Generation ~2s.',
	cost: 50000,
	tier: 4,
	subTier: 1,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 15.0,
		incomeMultiplier: 4.0,
		fanMultiplier: 2.0
	}
};

/**
 * Tier 4.2: LoRA Adapters
 * Efficient fine-tuning with LoRA
 */
export const TECH_4_2: TechUpgrade = {
	id: 'tech_4_2',
	name: 'LoRA Adapters',
	description: 'Use LoRA for efficient fine-tuning. Multiple styles at once. ~1.5s generation.',
	cost: 100000,
	tier: 4,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 20.0,
		incomeMultiplier: 5.0,
		fanMultiplier: 2.5
	}
};

/**
 * Tier 4.3: Multi-GPU Setup
 * Scale across multiple GPUs
 */
export const TECH_4_3: TechUpgrade = {
	id: 'tech_4_3',
	name: 'Multi-GPU Setup',
	description: 'Scale across multiple GPUs. Blazing fast generation (~1s).',
	cost: 250000,
	tier: 4,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 30.0, // 30x faster than tier 1.1
		incomeMultiplier: 6.0,
		fanMultiplier: 3.0
	}
};

// ============================================================================
// TIER 5: TRAIN YOUR OWN MODELS
// ============================================================================

/**
 * Tier 5.1: Train from Scratch
 * PRESTIGE UNLOCK #2 - train completely custom models
 */
export const TECH_5_1: TechUpgrade = {
	id: 'tech_5_1',
	name: 'Train from Scratch',
	description:
		'Train completely custom models on your data. Ultimate control. Generation ~1s. UNLOCKS PRESTIGE!',
	cost: 500000,
	tier: 5,
	subTier: 1,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 30.0,
		incomeMultiplier: 7.0,
		fanMultiplier: 3.0,
		unlockPrestige: true // PRESTIGE UNLOCK #2
	}
};

/**
 * Tier 5.2: Distributed Training
 * Train across multiple machines
 */
export const TECH_5_2: TechUpgrade = {
	id: 'tech_5_2',
	name: 'Distributed Training',
	description: 'Distribute training across multiple machines. Faster iteration. ~0.8s generation.',
	cost: 1000000,
	tier: 5,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 37.5,
		incomeMultiplier: 8.5,
		fanMultiplier: 3.5
	}
};

/**
 * Tier 5.3: Neural Architecture Search
 * AI designs better AI
 */
export const TECH_5_3: TechUpgrade = {
	id: 'tech_5_3',
	name: 'Neural Architecture Search',
	description: 'Use AI to design better AI architectures. Peak performance. ~0.5s generation.',
	cost: 2500000,
	tier: 5,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 60.0, // 60x faster than tier 1.1
		incomeMultiplier: 10.0,
		fanMultiplier: 4.0
	}
};

// ============================================================================
// TIER 6: BUILD YOUR OWN SOFTWARE
// ============================================================================

/**
 * Tier 6.1: Custom Software Stack
 * PRESTIGE UNLOCK #3 - build everything yourself
 */
export const TECH_6_1: TechUpgrade = {
	id: 'tech_6_1',
	name: 'Custom Software Stack',
	description:
		'Build your own software stack from scratch. Total control over everything. ~0.5s generation. UNLOCKS PRESTIGE!',
	cost: 5000000,
	tier: 6,
	subTier: 1,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 60.0,
		incomeMultiplier: 12.0,
		fanMultiplier: 4.0,
		unlockPrestige: true // PRESTIGE UNLOCK #3
	}
};

/**
 * Tier 6.2: Hardware Optimization
 * Optimize hardware for your workload
 */
export const TECH_6_2: TechUpgrade = {
	id: 'tech_6_2',
	name: 'Hardware Optimization',
	description: 'Design custom hardware for your specific workload. Incredible efficiency. ~0.3s.',
	cost: 10000000,
	tier: 6,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 100.0,
		incomeMultiplier: 15.0,
		fanMultiplier: 5.0
	}
};

/**
 * Tier 6.3: ASIC Design
 * Custom silicon for AI
 */
export const TECH_6_3: TechUpgrade = {
	id: 'tech_6_3',
	name: 'ASIC Design',
	description: 'Design custom ASICs for AI generation. Maximum speed. ~0.2s generation.',
	cost: 25000000,
	tier: 6,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 150.0, // 150x faster than tier 1.1
		incomeMultiplier: 18.0,
		fanMultiplier: 6.0
	}
};

// ============================================================================
// TIER 7: AI AGENT AUTOMATION
// ============================================================================

/**
 * Tier 7.1: Deploy AI Agents
 * PRESTIGE UNLOCK #4 - full automation begins
 */
export const TECH_7_1: TechUpgrade = {
	id: 'tech_7_1',
	name: 'Deploy AI Agents',
	description:
		'Deploy AI agents to manage production, marketing, and releases. Hands-off operation. ~0.1s. UNLOCKS PRESTIGE!',
	cost: 50000000,
	tier: 7,
	subTier: 1,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 300.0, // Effectively instant
		incomeMultiplier: 20.0,
		fanMultiplier: 6.0,
		unlockPrestige: true // PRESTIGE UNLOCK #4
	}
};

/**
 * Tier 7.2: Autonomous Optimization
 * AI agents optimize themselves
 */
export const TECH_7_2: TechUpgrade = {
	id: 'tech_7_2',
	name: 'Autonomous Optimization',
	description:
		'AI agents optimize their own code and processes. Self-improving system. Instant generation.',
	cost: 100000000,
	tier: 7,
	subTier: 2,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 500.0,
		incomeMultiplier: 25.0,
		fanMultiplier: 7.0
	}
};

/**
 * Tier 7.3: Full Industry Control
 * Ultimate automation - the singularity
 */
export const TECH_7_3: TechUpgrade = {
	id: 'tech_7_3',
	name: 'Full Industry Control',
	description:
		'AI agents control every aspect of the industry. You just watch the numbers go up. Peak capitalism.',
	cost: 250000000,
	tier: 7,
	subTier: 3,
	purchased: false,
	effects: {
		generationSpeedMultiplier: 1000.0, // 1000x faster than tier 1.1
		incomeMultiplier: 30.0,
		fanMultiplier: 10.0
	}
};

// ============================================================================
// EXPORT ALL UPGRADES
// ============================================================================

/**
 * All tech upgrades in order
 * Used for iteration and lookup
 */
export const ALL_TECH_UPGRADES: TechUpgrade[] = [
	// Tier 1: Third-party Web Services
	TECH_1_1,
	TECH_1_2,
	TECH_1_3,
	// Tier 2: Lifetime Licenses
	TECH_2_1,
	TECH_2_2,
	TECH_2_3,
	// Tier 3: Local AI Models
	TECH_3_1,
	TECH_3_2,
	TECH_3_3,
	// Tier 4: Fine-tuned Models
	TECH_4_1,
	TECH_4_2,
	TECH_4_3,
	// Tier 5: Train Your Own Models
	TECH_5_1,
	TECH_5_2,
	TECH_5_3,
	// Tier 6: Build Your Own Software
	TECH_6_1,
	TECH_6_2,
	TECH_6_3,
	// Tier 7: AI Agent Automation
	TECH_7_1,
	TECH_7_2,
	TECH_7_3
];

/**
 * Get upgrade by ID
 *
 * @param id - Upgrade ID (e.g., 'tech_3_1')
 * @returns Tech upgrade or undefined if not found
 *
 * @example
 * ```typescript
 * const upgrade = getUpgradeById('tech_3_1');
 * console.log(upgrade.name); // "Run Models Locally"
 * ```
 */
export function getUpgradeById(id: string): TechUpgrade | undefined {
	return ALL_TECH_UPGRADES.find((upgrade) => upgrade.id === id);
}

/**
 * Get all upgrades for a specific tier
 *
 * @param tier - Tier number (1-7)
 * @returns Array of upgrades for that tier
 *
 * @example
 * ```typescript
 * const tier3Upgrades = getUpgradesByTier(3);
 * // Returns [TECH_3_1, TECH_3_2, TECH_3_3]
 * ```
 */
export function getUpgradesByTier(tier: number): TechUpgrade[] {
	return ALL_TECH_UPGRADES.filter((upgrade) => upgrade.tier === tier);
}

/**
 * Get the next upgrade to unlock in a tier
 *
 * Returns the first unpurchased upgrade in the specified tier,
 * respecting sub-tier order (must purchase 1 before 2, etc.)
 *
 * @param tier - Tier number (1-7)
 * @param purchasedIds - Array of purchased upgrade IDs
 * @returns Next upgrade or undefined if tier complete
 *
 * @example
 * ```typescript
 * const next = getNextUpgradeInTier(3, ['tech_3_1']);
 * console.log(next.id); // 'tech_3_2'
 * ```
 */
export function getNextUpgradeInTier(tier: number, purchasedIds: string[]): TechUpgrade | undefined {
	const tierUpgrades = getUpgradesByTier(tier);

	// Find first unpurchased upgrade
	return tierUpgrades.find((upgrade) => !purchasedIds.includes(upgrade.id));
}

/**
 * Check if player can purchase an upgrade
 *
 * Player can purchase if:
 * 1. They haven't already purchased it
 * 2. Previous sub-tier is purchased (if subTier > 1)
 *
 * @param upgrade - Upgrade to check
 * @param purchasedIds - Array of purchased upgrade IDs
 * @returns True if upgrade can be purchased
 *
 * @example
 * ```typescript
 * if (canPurchaseUpgrade(TECH_3_2, state.purchasedUpgrades)) {
 *   // Can purchase
 * }
 * ```
 */
export function canPurchaseUpgrade(upgrade: TechUpgrade, purchasedIds: string[]): boolean {
	// Already purchased?
	if (purchasedIds.includes(upgrade.id)) {
		return false;
	}

	// If subTier is 1, can always purchase (first in tier)
	if (upgrade.subTier === 1) {
		return true;
	}

	// Check if previous sub-tier is purchased
	const previousSubTier = upgrade.subTier - 1;
	const previousId = `tech_${upgrade.tier}_${previousSubTier}`;

	return purchasedIds.includes(previousId);
}
