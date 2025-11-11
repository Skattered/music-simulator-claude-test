/**
 * Music Industry Simulator - Name Generation System
 *
 * Generates procedural names for:
 * - Songs
 * - Artists
 * - Albums
 *
 * Uses mad-lib style patterns combining words from different categories
 * to create unique, coherent names that fit the music industry theme.
 *
 * Features:
 * - Multiple name patterns for variety
 * - Duplicate prevention (caches recent names)
 * - Deterministic generation (can use seed if needed)
 * - Realistic music industry naming conventions
 */

import type { GameState } from '$lib/game/types';
import {
	ADJECTIVES,
	NOUNS,
	PLACES,
	VERBS,
	EMOTIONS,
	COLORS,
	getRandomWord
} from './words';

/**
 * Recent names cache to prevent duplicates
 * Stores the last 100 generated names
 */
const recentNames: string[] = [];
const MAX_RECENT_NAMES = 100;

/**
 * Add name to recent cache
 *
 * @param name - Name to add to cache
 */
function addToRecentNames(name: string): void {
	recentNames.push(name);

	// Keep only last MAX_RECENT_NAMES
	if (recentNames.length > MAX_RECENT_NAMES) {
		recentNames.shift();
	}
}

/**
 * Check if name was recently used
 *
 * @param name - Name to check
 * @returns True if name is in recent cache
 */
function isRecentName(name: string): boolean {
	return recentNames.includes(name);
}

/**
 * Generate a random song name
 *
 * Uses various patterns to create song names:
 * - "[Adjective] [Noun]" (e.g., "Electric Dreams")
 * - "[Verb] in [Place]" (e.g., "Dancing in Tokyo")
 * - "[Emotion] [Noun]" (e.g., "Lonely Nights")
 * - "[Noun] of [Place]" (e.g., "Thunder of Paradise")
 * - "[Color] [Noun]" (e.g., "Crimson Moon")
 * - "[Verb] [Noun]" (e.g., "Breaking Hearts")
 * - "[Adjective] [Place]" (e.g., "Neon Paradise")
 * - "[Noun] and [Noun]" (e.g., "Love and Hate")
 * - "[Verb] with [Noun]" (e.g., "Running with Wolves")
 * - "The [Noun]" (e.g., "The Storm")
 *
 * Attempts to avoid duplicate names from recent cache.
 * If a unique name cannot be generated after 10 attempts,
 * returns the last generated name anyway.
 *
 * @param state - Optional game state (for future genre-based generation)
 * @returns Generated song name
 *
 * @example
 * ```typescript
 * const songName = generateSongName();
 * console.log(songName); // "Electric Dreams"
 * ```
 */
export function generateSongName(state?: GameState): string {
	const patterns = [
		// [Adjective] [Noun]
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)}`,
		// [Verb] in [Place]
		() => `${getRandomWord(VERBS)} in ${getRandomWord(PLACES)}`,
		// [Emotion] [Noun]
		() => `${getRandomWord(EMOTIONS)} ${getRandomWord(NOUNS)}`,
		// [Noun] of [Place]
		() => `${getRandomWord(NOUNS)} of ${getRandomWord(PLACES)}`,
		// [Color] [Noun]
		() => `${getRandomWord(COLORS)} ${getRandomWord(NOUNS)}`,
		// [Verb] [Noun]
		() => `${getRandomWord(VERBS)} ${getRandomWord(NOUNS)}`,
		// [Adjective] [Place]
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(PLACES)}`,
		// [Noun] and [Noun]
		() => `${getRandomWord(NOUNS)} and ${getRandomWord(NOUNS)}`,
		// [Verb] with [Noun]
		() => `${getRandomWord(VERBS)} with ${getRandomWord(NOUNS)}`,
		// The [Noun]
		() => `The ${getRandomWord(NOUNS)}`,
		// [Adjective] [Verb]
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(VERBS)}`,
		// [Place] [Noun]
		() => `${getRandomWord(PLACES)} ${getRandomWord(NOUNS)}`
	];

	// Try to generate unique name
	let attempts = 0;
	let name = '';

	while (attempts < 10) {
		// Pick random pattern
		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		name = pattern();

		// Check if unique
		if (!isRecentName(name)) {
			addToRecentNames(name);
			return name;
		}

		attempts++;
	}

	// Give up on uniqueness after 10 attempts
	addToRecentNames(name);
	return name;
}

/**
 * Generate a random artist name
 *
 * Artist names use patterns that sound like stage names:
 * - "[Adjective] [Noun]" (e.g., "Electric Phoenix")
 * - "[Color] [Noun]" (e.g., "Crimson Wolf")
 * - "[Noun] [Noun]" (e.g., "Thunder Storm")
 * - "The [Adjective] [Nouns]" (e.g., "The Neon Hearts")
 * - "[Place] [Noun]" (e.g., "Tokyo Thunder")
 * - "[Emotion] [Noun]" (e.g., "Broken Dreams")
 * - "[Adjective]" (single word, e.g., "Electric")
 * - "[Noun]" (single word, e.g., "Phoenix")
 *
 * @returns Generated artist name
 *
 * @example
 * ```typescript
 * const artistName = generateArtistName();
 * console.log(artistName); // "Neon Phoenix"
 * ```
 */
export function generateArtistName(): string {
	const patterns = [
		// [Adjective] [Noun] - most common
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)}`,
		// [Color] [Noun]
		() => `${getRandomWord(COLORS)} ${getRandomWord(NOUNS)}`,
		// [Noun] [Noun]
		() => `${getRandomWord(NOUNS)} ${getRandomWord(NOUNS)}`,
		// The [Adjective] [Nouns] (plural)
		() => `The ${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)}s`,
		// [Place] [Noun]
		() => `${getRandomWord(PLACES)} ${getRandomWord(NOUNS)}`,
		// [Emotion] [Noun]
		() => `${getRandomWord(EMOTIONS)} ${getRandomWord(NOUNS)}`,
		// Single word adjective
		() => getRandomWord(ADJECTIVES),
		// Single word noun
		() => getRandomWord(NOUNS),
		// The [Noun]s (plural)
		() => `The ${getRandomWord(NOUNS)}s`,
		// [Adjective] [Place]
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(PLACES)}`
	];

	// Try to generate unique name
	let attempts = 0;
	let name = '';

	while (attempts < 10) {
		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		name = pattern();

		if (!isRecentName(name)) {
			addToRecentNames(name);
			return name;
		}

		attempts++;
	}

	addToRecentNames(name);
	return name;
}

/**
 * Generate a random album name
 *
 * Album names tend to be more abstract or thematic:
 * - "[Adjective] [Noun]" (e.g., "Electric Dreams")
 * - "[Noun] of [Place]" (e.g., "Thunder of Paradise")
 * - "[Emotion] [Nouns]" (e.g., "Lonely Nights")
 * - "[Color] [Noun]" (e.g., "Crimson Moon")
 * - "The [Adjective] [Noun]" (e.g., "The Silver Lining")
 * - "[Place]" (e.g., "Paradise")
 * - "[Noun] and [Noun]" (e.g., "Love and Hate")
 * - "[Adjective] [Place]" (e.g., "Neon Tokyo")
 *
 * @returns Generated album name
 *
 * @example
 * ```typescript
 * const albumName = generateAlbumName();
 * console.log(albumName); // "Midnight Paradise"
 * ```
 */
export function generateAlbumName(): string {
	const patterns = [
		// [Adjective] [Noun]
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)}`,
		// [Noun] of [Place]
		() => `${getRandomWord(NOUNS)} of ${getRandomWord(PLACES)}`,
		// [Emotion] [Nouns] (plural)
		() => `${getRandomWord(EMOTIONS)} ${getRandomWord(NOUNS)}s`,
		// [Color] [Noun]
		() => `${getRandomWord(COLORS)} ${getRandomWord(NOUNS)}`,
		// The [Adjective] [Noun]
		() => `The ${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)}`,
		// [Place] (single word)
		() => getRandomWord(PLACES),
		// [Noun] and [Noun]
		() => `${getRandomWord(NOUNS)} and ${getRandomWord(NOUNS)}`,
		// [Adjective] [Place]
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(PLACES)}`,
		// [Noun] [Noun]
		() => `${getRandomWord(NOUNS)} ${getRandomWord(NOUNS)}`,
		// [Color] [Place]
		() => `${getRandomWord(COLORS)} ${getRandomWord(PLACES)}`
	];

	// Try to generate unique name
	let attempts = 0;
	let name = '';

	while (attempts < 10) {
		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		name = pattern();

		if (!isRecentName(name)) {
			addToRecentNames(name);
			return name;
		}

		attempts++;
	}

	addToRecentNames(name);
	return name;
}

/**
 * Clear the recent names cache
 *
 * Useful for testing or when starting a new game.
 *
 * @example
 * ```typescript
 * clearRecentNames();
 * // All names can be generated again
 * ```
 */
export function clearRecentNames(): void {
	recentNames.length = 0;
}

/**
 * Get count of names in recent cache
 *
 * @returns Number of names in cache
 */
export function getRecentNamesCount(): number {
	return recentNames.length;
}

/**
 * Get all recent names (for debugging/testing)
 *
 * @returns Copy of recent names array
 */
export function getRecentNames(): string[] {
	return [...recentNames];
}

/**
 * Generate a random tour name
 *
 * Creates names like:
 * - "Electric Paradise Tour"
 * - "Midnight Dreams World Tour"
 * - "The Golden Night Tour"
 *
 * @returns Generated tour name
 *
 * @example
 * ```typescript
 * const tourName = generateTourName();
 * console.log(tourName); // "Electric Paradise Tour"
 * ```
 */
export function generateTourName(): string {
	const patterns = [
		// [Adjective] [Noun] Tour
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)} Tour`,
		// [Color] [Noun] Tour
		() => `${getRandomWord(COLORS)} ${getRandomWord(NOUNS)} Tour`,
		// The [Adjective] [Noun] Tour
		() => `The ${getRandomWord(ADJECTIVES)} ${getRandomWord(NOUNS)} Tour`,
		// [Emotion] [Nouns] Tour
		() => `${getRandomWord(EMOTIONS)} ${getRandomWord(NOUNS)}s Tour`,
		// [Noun] World Tour
		() => `${getRandomWord(NOUNS)} World Tour`,
		// [Adjective] [Place] Tour
		() => `${getRandomWord(ADJECTIVES)} ${getRandomWord(PLACES)} Tour`,
		// [Verb]ing the [Place]
		() => `${getRandomWord(VERBS)}ing the ${getRandomWord(PLACES)}`
	];

	// Try to generate unique name
	let attempts = 0;
	let name = '';

	while (attempts < 10) {
		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		name = pattern();

		if (!isRecentName(name)) {
			addToRecentNames(name);
			return name;
		}

		attempts++;
	}

	addToRecentNames(name);
	return name;
}
