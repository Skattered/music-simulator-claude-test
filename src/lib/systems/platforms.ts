/**
 * Music Industry Simulator - Platform Ownership & Industry Control
 *
 * Final end-game systems:
 * - Purchase industry platforms
 * - Accumulate industry control %
 * - Win at 100% control
 */

import type { GameState } from '$lib/game/types';
import { ALL_PLATFORMS, getPlatformById } from '$lib/data/platforms';

/**
 * Check if player can purchase platform
 */
export function canPurchasePlatform(state: GameState, platformId: string): boolean {
	const platform = getPlatformById(platformId);
	if (!platform) return false;

	// Already owned?
	if (state.ownedPlatforms.includes(platformId)) {
		return false;
	}

	// Can afford?
	return state.money >= platform.cost;
}

/**
 * Purchase a platform
 */
export function purchasePlatform(state: GameState, platformId: string): boolean {
	if (!canPurchasePlatform(state, platformId)) {
		return false;
	}

	const platform = getPlatformById(platformId);
	if (!platform) return false;

	// Deduct cost
	state.money -= platform.cost;

	// Add to owned platforms
	state.ownedPlatforms.push(platformId);

	// Increase industry control
	state.industryControl += platform.controlContribution;

	console.log(
		`[Platforms] Purchased ${platform.name} - Industry control now at ${state.industryControl}%`
	);

	return true;
}

/**
 * Get total platform income multiplier
 */
export function getPlatformIncomeMultiplier(state: GameState): number {
	let multiplier = 1.0;

	for (const platformId of state.ownedPlatforms) {
		const platform = getPlatformById(platformId);
		if (platform) {
			multiplier *= platform.incomeMultiplier;
		}
	}

	return multiplier;
}

/**
 * Check if player has won (100% industry control)
 */
export function hasWon(state: GameState): boolean {
	return state.industryControl >= 100;
}

/**
 * Get available platforms (not yet owned)
 */
export function getAvailablePlatforms(state: GameState) {
	return ALL_PLATFORMS.filter((p) => !state.ownedPlatforms.includes(p.id));
}
