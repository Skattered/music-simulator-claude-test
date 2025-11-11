/**
 * Music Industry Simulator - Platform Ownership Data
 *
 * Defines purchasable industry platforms that provide:
 * - Passive income multipliers
 * - Industry control percentage
 * - Path to victory (100% control)
 */

import type { Platform } from '$lib/game/types';

/**
 * All industry platforms
 * Purchased in order from cheapest to most expensive
 */
export const ALL_PLATFORMS: Platform[] = [
	{
		id: 'platform_spotify',
		name: 'Spotify Clone',
		description: 'Launch your own streaming service. +20% income, +10% control.',
		cost: 100000,
		owned: false,
		incomeMultiplier: 1.2,
		controlContribution: 10
	},
	{
		id: 'platform_label',
		name: 'Record Label',
		description: 'Start your own record label. +30% income, +15% control.',
		cost: 500000,
		owned: false,
		incomeMultiplier: 1.3,
		controlContribution: 15
	},
	{
		id: 'platform_distributor',
		name: 'Distribution Network',
		description: 'Control music distribution. +40% income, +15% control.',
		cost: 2000000,
		owned: false,
		incomeMultiplier: 1.4,
		controlContribution: 15
	},
	{
		id: 'platform_radio',
		name: 'Radio Conglomerate',
		description: 'Buy all the radio stations. +50% income, +20% control.',
		cost: 10000000,
		owned: false,
		incomeMultiplier: 1.5,
		controlContribution: 20
	},
	{
		id: 'platform_venues',
		name: 'Venue Chain',
		description: 'Own all major concert venues. +60% income, +20% control.',
		cost: 50000000,
		owned: false,
		incomeMultiplier: 1.6,
		controlContribution: 20
	},
	{
		id: 'platform_media',
		name: 'Media Empire',
		description: 'Control music media and press. +100% income, +20% control.',
		cost: 250000000,
		owned: false,
		incomeMultiplier: 2.0,
		controlContribution: 20
	}
];

/**
 * Get platform by ID
 */
export function getPlatformById(id: string): Platform | undefined {
	return ALL_PLATFORMS.find((p) => p.id === id);
}
