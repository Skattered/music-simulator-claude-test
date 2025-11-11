/**
 * Music Industry Simulator - Game Configuration
 *
 * This file contains all game constants, balance values, and configuration.
 * All values are centralized here for easy tuning and balance adjustments.
 *
 * IMPORTANT: Balance values are loaded from balance-config.json to allow
 * hot-reloading and easy balance iteration during playtesting.
 */

import balanceConfigJson from './balance-config.json';
import type { GameState, TechUpgrade } from './types';

// ============================================================================
// BALANCE CONFIGURATION
// ============================================================================

/**
 * Centralized balance configuration loaded from JSON
 * This is the single source of truth for all balance values
 */
export const BALANCE_CONFIG = balanceConfigJson;

// ============================================================================
// CORE GAME SETTINGS
// ============================================================================

/**
 * Game loop runs at 10 ticks per second (100ms per tick)
 * This provides smooth updates without excessive CPU usage
 */
export const TICK_RATE = BALANCE_CONFIG.gameSettings.tickRate; // 0.1 seconds = 100ms
export const TICKS_PER_SECOND = BALANCE_CONFIG.gameSettings.ticksPerSecond; // 10 TPS

/**
 * Auto-save interval in seconds
 * Game saves to localStorage every 10 seconds to prevent data loss
 */
export const AUTO_SAVE_INTERVAL = BALANCE_CONFIG.gameSettings.autoSaveInterval; // seconds

/**
 * localStorage keys for save data
 */
export const SAVE_KEY = 'music-industry-simulator-save';
export const BACKUP_KEY = 'music-industry-simulator-backup';

/**
 * Current game version for save compatibility
 */
export const GAME_VERSION = '1.0.0';

// ============================================================================
// INITIAL GAME STATE
// ============================================================================

/**
 * Creates a new game state with starting values
 * Used when starting a new game or after a hard reset
 *
 * @returns Fresh GameState with initial values
 */
export function createInitialGameState(): GameState {
	return {
		version: GAME_VERSION,

		// Starting resources
		money: BALANCE_CONFIG.initialValues.startingMoney, // $10 to start
		gpu: 0, // Unlocked later

		// Starting artist
		currentArtist: {
			name: 'New Artist', // Will be replaced with generated name
			totalSongs: 0,
			fans: 0,
			peakFans: 0
		},
		legacyArtists: [],
		totalPrestiges: 0,

		// Song state
		totalCompletedSongs: 0,
		songsInQueue: [],

		// Tech progression
		currentTechTier: 1, // Start at tier 1: Third-party Web Services
		purchasedUpgrades: [],
		activeBoosts: [],

		// Physical albums (unlocked later)
		activeAlbumBatch: null,
		lastAlbumTimestamp: 0,
		totalAlbumsReleased: 0,

		// Tours (unlocked later)
		activeTour: null,
		lastTourEndTime: 0,
		tourCooldownSeconds: BALANCE_CONFIG.tours.minCooldownDays * 24 * 60 * 60,
		totalToursCompleted: 0,

		// Platform ownership (late game)
		ownedPlatforms: [],

		// Progression
		industryControl: 0, // 0-100%, persists through prestige
		unlockedSystems: {
			prestige: false,
			gpu: false,
			physicalAlbums: false,
			tours: false,
			platformOwnership: false,
			trendResearch: false
		},
		trendingGenre: 'pop', // Default starting genre
		experienceMultiplier: 1.0, // Increases with prestiges

		// Meta
		lastSaveTime: Date.now(),
		totalTimePlayed: 0,
		gameStartTime: Date.now()
	};
}

// ============================================================================
// TECH TIER DEFINITIONS
// ============================================================================

/**
 * Tech Tier 1: Third-party Web Services
 * Starting point - pay per song, manual generation
 */
export const TECH_TIER_1 = {
	tier: 1,
	name: 'Third-party Web Services',
	description: 'Pay per song generation. Manual creation with ~30 second generation time.',
	baseCost: 0, // Already have this
	songCost: 1, // $1 per song
	generationTime: 30, // seconds
	incomeMultiplier: 1.0, // Base income
	fanMultiplier: 1.0
};

/**
 * Tech Tier 2: Lifetime Licenses/Subscriptions
 * Songs become FREE to generate, faster generation
 */
export const TECH_TIER_2 = {
	tier: 2,
	name: 'Lifetime Licenses',
	description: 'Songs become FREE to generate. Reduced generation time (~15 seconds).',
	baseCost: 500,
	songCost: 0, // FREE!
	generationTime: 15, // seconds
	incomeMultiplier: 1.5, // 50% more income per song
	fanMultiplier: 1.2
};

/**
 * Tech Tier 3: Local AI Models
 * Automation begins, GPU unlocked, PRESTIGE UNLOCK #1
 */
export const TECH_TIER_3 = {
	tier: 3,
	name: 'Local AI Models',
	description:
		'Automation begins! AI agents start managing production. Further reduced generation time (~5 seconds).',
	baseCost: 5000,
	songCost: 0,
	generationTime: 5, // seconds
	incomeMultiplier: 2.5, // Better quality = more income
	fanMultiplier: 1.5,
	unlockPrestige: true, // PRESTIGE UNLOCK #1
	unlockGPU: true
};

/**
 * Tech Tier 4: Fine-tuned Models
 * Continued automation improvements, very fast generation
 */
export const TECH_TIER_4 = {
	tier: 4,
	name: 'Fine-tuned Models',
	description: 'Continued automation improvements. Generation time ~2 seconds.',
	baseCost: 50000,
	songCost: 0,
	generationTime: 2, // seconds
	incomeMultiplier: 4.0,
	fanMultiplier: 2.0
};

/**
 * Tech Tier 5: Train Your Own Models
 * Near-instant generation, PRESTIGE UNLOCK #2
 */
export const TECH_TIER_5 = {
	tier: 5,
	name: 'Train Your Own Models',
	description: 'Near-instant generation (~1 second). Major income boost. Custom AI trained on your style.',
	baseCost: 500000,
	songCost: 0,
	generationTime: 1, // second
	incomeMultiplier: 7.0,
	fanMultiplier: 3.0,
	unlockPrestige: true // PRESTIGE UNLOCK #2
};

/**
 * Tech Tier 6: Build Your Own Software
 * Instant generation, maximum income, PRESTIGE UNLOCK #3
 */
export const TECH_TIER_6 = {
	tier: 6,
	name: 'Build Your Own Software',
	description: 'Instant generation. Maximum income per song. Complete control over the stack.',
	baseCost: 5000000,
	songCost: 0,
	generationTime: 0.5, // Nearly instant
	incomeMultiplier: 12.0,
	fanMultiplier: 4.0,
	unlockPrestige: true // PRESTIGE UNLOCK #3
};

/**
 * Tech Tier 7: AI Agent Automation
 * Ultimate "hands-off" tier, PRESTIGE UNLOCK #4
 */
export const TECH_TIER_7 = {
	tier: 7,
	name: 'AI Agent Automation',
	description:
		'Deploy AI agents to manage production, marketing, releases. Automate all operations. Ultimate hands-off tier.',
	baseCost: 50000000,
	songCost: 0,
	generationTime: 0.1, // Effectively instant
	incomeMultiplier: 20.0,
	fanMultiplier: 6.0,
	unlockPrestige: true // PRESTIGE UNLOCK #4
};

/**
 * Array of all tech tiers for iteration
 */
export const TECH_TIERS = [
	TECH_TIER_1,
	TECH_TIER_2,
	TECH_TIER_3,
	TECH_TIER_4,
	TECH_TIER_5,
	TECH_TIER_6,
	TECH_TIER_7
];

/**
 * Get tech tier configuration by tier number
 *
 * @param tier - Tier number (1-7)
 * @returns Tech tier configuration or tier 1 as fallback
 */
export function getTechTier(tier: number) {
	return TECH_TIERS.find((t) => t.tier === tier) || TECH_TIER_1;
}

// ============================================================================
// PHASE UNLOCK REQUIREMENTS
// ============================================================================

/**
 * Requirements to unlock Physical Albums (Phase 2)
 */
export const UNLOCK_PHYSICAL_ALBUMS = {
	songs: BALANCE_CONFIG.unlockRequirements.physicalAlbums.songs,
	fans: BALANCE_CONFIG.unlockRequirements.physicalAlbums.fans,
	money: BALANCE_CONFIG.unlockRequirements.physicalAlbums.money
};

/**
 * Requirements to unlock Tours & Concerts (Phase 3)
 */
export const UNLOCK_TOURS = {
	albums: BALANCE_CONFIG.unlockRequirements.tours.albums,
	fans: BALANCE_CONFIG.unlockRequirements.tours.fans,
	techTier: BALANCE_CONFIG.unlockRequirements.tours.techTier
};

/**
 * Requirements to unlock Platform Ownership (Phase 4)
 */
export const UNLOCK_PLATFORMS = {
	tours: BALANCE_CONFIG.unlockRequirements.platformOwnership.tours,
	fans: BALANCE_CONFIG.unlockRequirements.platformOwnership.fans,
	techTier: BALANCE_CONFIG.unlockRequirements.platformOwnership.techTier
};

/**
 * Requirements to unlock Full Automation (Phase 5)
 */
export const UNLOCK_AUTOMATION = {
	platforms: BALANCE_CONFIG.unlockRequirements.fullAutomation.platforms,
	fans: BALANCE_CONFIG.unlockRequirements.fullAutomation.fans,
	techTier: BALANCE_CONFIG.unlockRequirements.fullAutomation.techTier
};

// ============================================================================
// STREAMING REVENUE CONSTANTS
// ============================================================================

/**
 * Base streaming rate: revenue per fan per song per tick
 * This is the fundamental income calculation
 *
 * Formula: streaming_revenue_per_tick = total_completed_songs * total_fans * BASE_STREAMING_RATE * platform_multiplier
 *
 * CRITICAL: Streaming must remain 15-30% of total income throughout the game
 */
export const BASE_STREAMING_RATE = BALANCE_CONFIG.streaming.baseRate; // 0.001

/**
 * Default platform multiplier (1.0 unless player owns streaming platform)
 */
export const PLATFORM_MULTIPLIER_DEFAULT = BALANCE_CONFIG.streaming.platformMultiplierDefault; // 1.0

// ============================================================================
// ALBUM CONSTANTS
// ============================================================================

/**
 * Percentage of fans who buy albums per day at peak demand
 */
export const ALBUM_INTEREST_RATE = BALANCE_CONFIG.albums.interestRate; // 1% = 0.01

/**
 * Days until unsold album copies expire
 */
export const ALBUM_LIFETIME_DAYS = BALANCE_CONFIG.albums.lifetimeDays; // 30 days

/**
 * Exponential decay rate for album demand after week 1
 * Week 2: 35%, Week 3: 12%, Week 4: 3%
 */
export const ALBUM_DEMAND_DECAY_RATE = BALANCE_CONFIG.albums.demandDecayRate; // 0.15

/**
 * Hours between album releases (cooldown)
 */
export const ALBUM_COOLDOWN_HOURS = BALANCE_CONFIG.albums.cooldownHours; // 48 hours

/**
 * Base copies per dollar spent (subject to sublinear scaling)
 */
export const BASE_COPIES_PER_DOLLAR = BALANCE_CONFIG.albums.baseCopiesPerDollar; // 10

/**
 * Scale penalty for larger batches (square root scaling)
 */
export const ALBUM_SCALE_PENALTY = BALANCE_CONFIG.albums.scalePenalty; // 0.5

/**
 * Profit margin on album sales (50% profit if all sell)
 */
export const ALBUM_PROFIT_MARGIN = BALANCE_CONFIG.albums.profitMargin; // 1.5

// ============================================================================
// TOUR CONSTANTS
// ============================================================================

/**
 * Minimum tour duration in days
 */
export const TOUR_MIN_DURATION_DAYS = BALANCE_CONFIG.tours.minDurationDays; // 30

/**
 * Maximum tour duration in days
 */
export const TOUR_MAX_DURATION_DAYS = BALANCE_CONFIG.tours.maxDurationDays; // 90

/**
 * Minimum revenue multiplier for tours
 */
export const TOUR_MIN_MULTIPLIER = BALANCE_CONFIG.tours.minMultiplier; // 1.5x

/**
 * Maximum revenue multiplier for tours
 */
export const TOUR_MAX_MULTIPLIER = BALANCE_CONFIG.tours.maxMultiplier; // 3.0x

/**
 * Minimum cooldown between tours in days
 */
export const TOUR_MIN_COOLDOWN_DAYS = BALANCE_CONFIG.tours.minCooldownDays; // 14

/**
 * Maximum cooldown between tours in days
 */
export const TOUR_MAX_COOLDOWN_DAYS = BALANCE_CONFIG.tours.maxCooldownDays; // 30

/**
 * Base cost for small venue tour
 */
export const BASE_TOUR_COST = BALANCE_CONFIG.tours.baseCost; // 10000

/**
 * Fan cost scaling (square root) for tour venues
 */
export const FAN_COST_SCALING = BALANCE_CONFIG.tours.fanCostScaling; // 0.5

// ============================================================================
// TIER SCALING RULES
// ============================================================================

/**
 * Minimum multiplier between tiers (1.5x)
 */
export const TIER_SCALE_MIN = BALANCE_CONFIG.tierScaling.minMultiplier; // 1.5

/**
 * Maximum multiplier between tiers (2.5x)
 */
export const TIER_SCALE_MAX = BALANCE_CONFIG.tierScaling.maxMultiplier; // 2.5

/**
 * Absolute maximum - never exceed 5x between tiers
 */
export const TIER_SCALE_ABSOLUTE_MAX = BALANCE_CONFIG.tierScaling.absoluteMax; // 5.0

/**
 * Previous tier must contribute at least 20% of total income
 */
export const PREVIOUS_TIER_MIN_CONTRIBUTION = BALANCE_CONFIG.tierScaling.previousTierMinContribution; // 0.2

// ============================================================================
// BALANCE VALIDATION THRESHOLDS
// ============================================================================

/**
 * No single income source should exceed 60% of total income
 */
export const MAX_SINGLE_SOURCE_PERCENTAGE = BALANCE_CONFIG.balance.maxSingleSourcePercentage; // 0.6

/**
 * Streaming must remain 15-30% of total income
 */
export const STREAMING_MIN_PERCENTAGE = BALANCE_CONFIG.streaming.minIncomePercentage; // 0.15
export const STREAMING_MAX_PERCENTAGE = BALANCE_CONFIG.streaming.maxIncomePercentage; // 0.3

// ============================================================================
// EXPLOITATION ABILITIES (Base Definitions)
// ============================================================================

/**
 * These are defined here as constants, but full ability definitions
 * will be in src/lib/data/abilities.ts with descriptions and flavor text
 */

/**
 * Bot Streams ability - temporary income boost
 */
export const ABILITY_BOT_STREAMS = {
	id: 'bot_streams',
	baseCost: 100,
	costScaling: 1.3, // Cost increases 30% per use
	duration: 60, // 60 seconds
	multiplier: 1.5, // 50% income boost
	type: 'income' as const
};

/**
 * Playlist Placement ability - temporary fan boost
 */
export const ABILITY_PLAYLIST_PLACEMENT = {
	id: 'playlist_placement',
	baseCost: 500,
	costScaling: 1.3,
	duration: 120, // 2 minutes
	multiplier: 2.0, // 2x fan generation
	type: 'fans' as const
};

/**
 * Social Media Campaign ability - fan growth boost
 */
export const ABILITY_SOCIAL_MEDIA = {
	id: 'social_media',
	baseCost: 1000,
	costScaling: 1.4,
	duration: 180, // 3 minutes
	multiplier: 1.8, // 80% fan boost
	type: 'fans' as const
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert seconds to milliseconds
 *
 * @param seconds - Time in seconds
 * @returns Time in milliseconds
 */
export function secondsToMs(seconds: number): number {
	return seconds * 1000;
}

/**
 * Convert days to seconds
 *
 * @param days - Time in days
 * @returns Time in seconds
 */
export function daysToSeconds(days: number): number {
	return days * 24 * 60 * 60;
}

/**
 * Convert hours to seconds
 *
 * @param hours - Time in hours
 * @returns Time in seconds
 */
export function hoursToSeconds(hours: number): number {
	return hours * 60 * 60;
}
