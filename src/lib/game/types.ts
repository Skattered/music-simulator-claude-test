/**
 * Music Industry Simulator - TypeScript Type Definitions
 * Core game state and data structures
 */

/**
 * Queued song waiting to be generated
 */
export interface QueuedSong {
	/** UUID for the song */
	id: string;
	/** Timestamp when song will complete */
	completionTime: number;
	/** Index for ordering in queue */
	songIndex: number;
}

/**
 * Current artist information
 */
export interface Artist {
	/** Generated artist name */
	name: string;
	/** Total songs completed by this artist */
	totalSongs: number;
	/** Current fan count */
	fans: number;
	/** Peak fans achieved (used for prestige calculation) */
	peakFans: number;
}

/**
 * Legacy artist from previous prestige
 */
export interface LegacyArtist {
	/** Artist name */
	name: string;
	/** Songs completed when prestiged */
	totalSongs: number;
	/** Fans at time of prestige */
	fans: number;
	/** Income multiplier (typically 0.8 = 80% of original rate) */
	incomeMultiplier: number;
	/** Timestamp when this artist was created (for display purposes) */
	createdAt: number;
}

/**
 * Temporary boost from exploitation abilities
 */
export interface ActiveBoost {
	/** Unique identifier for the ability */
	abilityId: string;
	/** Display name of the ability */
	name: string;
	/** Multiplier value (e.g., 2.0 = 2x income) */
	multiplier: number;
	/** Timestamp when boost expires */
	expiresAt: number;
	/** Type of boost: 'income' | 'fans' | 'speed' */
	type: 'income' | 'fans' | 'speed';
}

/**
 * Purchased tech upgrade
 */
export interface TechUpgrade {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Description/flavor text */
	description: string;
	/** Cost in money */
	cost: number;
	/** Tech tier (1-7) */
	tier: number;
	/** Sub-tier within tier (1-3) */
	subTier: number;
	/** Has this been purchased? */
	purchased: boolean;
	/** Effects applied when purchased */
	effects: {
		/** Multiplier for song generation speed (0.5 = 50% faster) */
		generationSpeedMultiplier?: number;
		/** Multiplier for income per song */
		incomeMultiplier?: number;
		/** Multiplier for fan generation */
		fanMultiplier?: number;
		/** Unlock prestige system */
		unlockPrestige?: boolean;
		/** Unlock GPU resource system */
		unlockGPU?: boolean;
	};
}

/**
 * Physical album batch
 */
export interface PhysicalAlbum {
	/** UUID */
	id: string;
	/** Generated album name */
	name: string;
	/** Timestamp when album was released */
	releaseTime: number;
	/** Number of copies pressed */
	copiesPressed: number;
	/** Copies remaining to sell */
	copiesRemaining: number;
	/** Price per copy */
	pricePerCopy: number;
	/** Total revenue generated so far */
	revenueGenerated: number;
	/** Press timestamp for demand decay calculation */
	pressTimestamp: number;
}

/**
 * Active tour
 */
export interface Tour {
	/** UUID */
	id: string;
	/** Generated tour name */
	name: string;
	/** Tour tier (determines multiplier strength) */
	tier: number;
	/** Start timestamp */
	startTime: number;
	/** End timestamp */
	endTime: number;
	/** Duration in seconds */
	durationSeconds: number;
	/** Revenue multiplier applied to ALL income sources */
	revenueMultiplier: number;
	/** Cost paid to start the tour */
	cost: number;
}

/**
 * Owned industry platform
 */
export interface Platform {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Description/flavor text */
	description: string;
	/** Purchase cost */
	cost: number;
	/** Has this been purchased? */
	owned: boolean;
	/** Passive income multiplier */
	incomeMultiplier: number;
	/** Industry control % contribution */
	controlContribution: number;
}

/**
 * Feature unlock flags
 */
export interface UnlockedSystems {
	/** Can prestige (create new artist) */
	prestige: boolean;
	/** GPU resource system available */
	gpu: boolean;
	/** Physical album releases */
	physicalAlbums: boolean;
	/** Tours and concerts */
	tours: boolean;
	/** Platform ownership (monopoly) */
	platformOwnership: boolean;
	/** Trend research system */
	trendResearch: boolean;
}

/**
 * Main game state
 * All game data stored in this structure
 */
export interface GameState {
	/** Game version for save compatibility */
	version: string;

	/** --- RESOURCES --- */
	/** Current money */
	money: number;
	/** GPU resources (unlocked mid-game) */
	gpu: number;

	/** --- ARTIST --- */
	/** Current artist */
	currentArtist: Artist;
	/** Legacy artists from prestiges (max 2-3) */
	legacyArtists: LegacyArtist[];
	/** Total number of prestiges performed */
	totalPrestiges: number;

	/** --- SONGS --- */
	/** Total completed songs (never decreases) */
	totalCompletedSongs: number;
	/** Songs currently being generated */
	songsInQueue: QueuedSong[];

	/** --- UPGRADES & TECH --- */
	/** Current tech tier (1-7) */
	currentTechTier: number;
	/** Purchased tech upgrades */
	purchasedUpgrades: string[]; // Array of upgrade IDs
	/** Active temporary boosts from exploitation */
	activeBoosts: ActiveBoost[];

	/** --- PHYSICAL ALBUMS --- */
	/** Active album batch being sold */
	activeAlbumBatch: PhysicalAlbum | null;
	/** Timestamp of last album release */
	lastAlbumTimestamp: number;
	/** Total albums released */
	totalAlbumsReleased: number;

	/** --- TOURS --- */
	/** Currently active tour (only 1 at a time) */
	activeTour: Tour | null;
	/** Timestamp when last tour ended */
	lastTourEndTime: number;
	/** Tour cooldown duration in seconds */
	tourCooldownSeconds: number;
	/** Total tours completed */
	totalToursCompleted: number;

	/** --- PLATFORMS & MONOPOLY --- */
	/** Owned industry platforms */
	ownedPlatforms: string[]; // Array of platform IDs

	/** --- PROGRESSION --- */
	/** Industry control percentage (0-100, persists through prestige) */
	industryControl: number;
	/** Which systems are unlocked */
	unlockedSystems: UnlockedSystems;
	/** Current trending genre (for trend research) */
	trendingGenre: string;
	/** Experience multiplier from prestiges */
	experienceMultiplier: number;

	/** --- META --- */
	/** Last save timestamp */
	lastSaveTime: number;
	/** Total time played in seconds */
	totalTimePlayed: number;
	/** Game started timestamp */
	gameStartTime: number;
}

/**
 * Exploitation ability definition
 */
export interface ExploitationAbility {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Description/flavor text */
	description: string;
	/** Base cost (scales with use) */
	baseCost: number;
	/** Cost scaling factor (each use multiplies cost) */
	costScaling: number;
	/** Duration in seconds */
	duration: number;
	/** Multiplier strength */
	multiplier: number;
	/** Type of boost */
	type: 'income' | 'fans' | 'speed';
	/** Number of times used (for cost scaling) */
	timesUsed: number;
}

/**
 * Save file structure
 */
export interface SaveFile {
	/** Game state */
	state: GameState;
	/** Timestamp when saved */
	savedAt: number;
	/** Game version */
	version: string;
}
