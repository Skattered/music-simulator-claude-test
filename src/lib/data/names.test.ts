/**
 * Unit tests for Name Generation System
 *
 * Tests the procedural generation of:
 * - Song names
 * - Artist names
 * - Album names
 *
 * Verifies:
 * - Names are generated
 * - Names are non-empty strings
 * - Duplicate prevention works
 * - Cache management functions correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	generateSongName,
	generateArtistName,
	generateAlbumName,
	clearRecentNames,
	getRecentNamesCount,
	getRecentNames
} from './names';

describe('Name Generation System', () => {
	beforeEach(() => {
		// Clear cache before each test
		clearRecentNames();
	});

	// ========================================================================
	// SONG NAME TESTS
	// ========================================================================

	describe('generateSongName()', () => {
		it('should generate a song name', () => {
			const name = generateSongName();

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);
		});

		it('should generate different names on multiple calls', () => {
			const name1 = generateSongName();
			const name2 = generateSongName();
			const name3 = generateSongName();

			// At least some should be different (very unlikely to get 3 identical)
			const allSame = name1 === name2 && name2 === name3;
			expect(allSame).toBe(false);
		});

		it('should generate valid song name patterns', () => {
			// Generate 20 names and check they match expected patterns
			for (let i = 0; i < 20; i++) {
				const name = generateSongName();

				// Should contain at least one word
				expect(name.split(' ').length).toBeGreaterThan(0);

				// Should not be empty
				expect(name.trim()).not.toBe('');

				// Should not have double spaces
				expect(name).not.toMatch(/  /);

				// Should start with capital letter
				expect(name[0]).toMatch(/[A-Z]/);
			}
		});

		it('should add names to recent cache', () => {
			expect(getRecentNamesCount()).toBe(0);

			generateSongName();
			expect(getRecentNamesCount()).toBe(1);

			generateSongName();
			expect(getRecentNamesCount()).toBe(2);
		});

		it('should avoid recently used names', () => {
			const names = new Set<string>();

			// Generate 50 names
			for (let i = 0; i < 50; i++) {
				const name = generateSongName();
				names.add(name);
			}

			// Should have at least 40 unique names (allowing some duplicates due to randomness)
			expect(names.size).toBeGreaterThanOrEqual(40);
		});

		it('should handle being called with game state', () => {
			// Test that optional state parameter doesn't break anything
			const state = {
				trendingGenre: 'pop'
			} as any;

			const name = generateSongName(state);
			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
		});
	});

	// ========================================================================
	// ARTIST NAME TESTS
	// ========================================================================

	describe('generateArtistName()', () => {
		it('should generate an artist name', () => {
			const name = generateArtistName();

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);
		});

		it('should generate different names on multiple calls', () => {
			const name1 = generateArtistName();
			const name2 = generateArtistName();
			const name3 = generateArtistName();

			const allSame = name1 === name2 && name2 === name3;
			expect(allSame).toBe(false);
		});

		it('should generate valid artist name patterns', () => {
			for (let i = 0; i < 20; i++) {
				const name = generateArtistName();

				// Should not be empty
				expect(name.trim()).not.toBe('');

				// Should not have double spaces
				expect(name).not.toMatch(/  /);

				// Should start with capital letter or "The"
				expect(name[0]).toMatch(/[A-Z]/);
			}
		});

		it('should add names to recent cache', () => {
			clearRecentNames();

			generateArtistName();
			expect(getRecentNamesCount()).toBe(1);

			generateArtistName();
			expect(getRecentNamesCount()).toBe(2);
		});

		it('should generate unique names most of the time', () => {
			clearRecentNames();
			const names = new Set<string>();

			// Generate 50 names
			for (let i = 0; i < 50; i++) {
				const name = generateArtistName();
				names.add(name);
			}

			// Should have at least 40 unique names
			expect(names.size).toBeGreaterThanOrEqual(40);
		});
	});

	// ========================================================================
	// ALBUM NAME TESTS
	// ========================================================================

	describe('generateAlbumName()', () => {
		it('should generate an album name', () => {
			const name = generateAlbumName();

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);
		});

		it('should generate different names on multiple calls', () => {
			const name1 = generateAlbumName();
			const name2 = generateAlbumName();
			const name3 = generateAlbumName();

			const allSame = name1 === name2 && name2 === name3;
			expect(allSame).toBe(false);
		});

		it('should generate valid album name patterns', () => {
			for (let i = 0; i < 20; i++) {
				const name = generateAlbumName();

				// Should not be empty
				expect(name.trim()).not.toBe('');

				// Should not have double spaces
				expect(name).not.toMatch(/  /);

				// Should start with capital letter or "The"
				expect(name[0]).toMatch(/[A-Z]/);
			}
		});

		it('should add names to recent cache', () => {
			clearRecentNames();

			generateAlbumName();
			expect(getRecentNamesCount()).toBe(1);

			generateAlbumName();
			expect(getRecentNamesCount()).toBe(2);
		});

		it('should generate unique names most of the time', () => {
			clearRecentNames();
			const names = new Set<string>();

			// Generate 50 names
			for (let i = 0; i < 50; i++) {
				const name = generateAlbumName();
				names.add(name);
			}

			// Should have at least 40 unique names
			expect(names.size).toBeGreaterThanOrEqual(40);
		});
	});

	// ========================================================================
	// CACHE MANAGEMENT TESTS
	// ========================================================================

	describe('Cache management', () => {
		it('should clear recent names', () => {
			generateSongName();
			generateSongName();
			generateSongName();

			expect(getRecentNamesCount()).toBeGreaterThan(0);

			clearRecentNames();

			expect(getRecentNamesCount()).toBe(0);
		});

		it('should limit cache to 100 names', () => {
			// Generate 150 names
			for (let i = 0; i < 150; i++) {
				generateSongName();
			}

			// Should only keep last 100
			expect(getRecentNamesCount()).toBe(100);
		});

		it('should return copy of recent names', () => {
			generateSongName();
			generateSongName();

			const recent = getRecentNames();

			expect(Array.isArray(recent)).toBe(true);
			expect(recent.length).toBe(2);

			// Modifying the copy shouldn't affect the cache
			recent.push('Test Name');
			expect(getRecentNamesCount()).toBe(2); // Still 2, not 3
		});

		it('should track names across different generation functions', () => {
			clearRecentNames();

			generateSongName();
			expect(getRecentNamesCount()).toBe(1);

			generateArtistName();
			expect(getRecentNamesCount()).toBe(2);

			generateAlbumName();
			expect(getRecentNamesCount()).toBe(3);
		});

		it('should allow duplicate after eviction from cache', () => {
			clearRecentNames();

			// Generate a name and record it
			const firstName = generateSongName();

			// Generate 101 more names to push first name out of cache
			for (let i = 0; i < 101; i++) {
				generateSongName();
			}

			// First name should no longer be in cache
			const recent = getRecentNames();
			expect(recent).not.toContain(firstName);
		});
	});

	// ========================================================================
	// INTEGRATION TESTS
	// ========================================================================

	describe('Integration: Mixed generation', () => {
		it('should generate diverse names across all types', () => {
			clearRecentNames();

			const songs = new Set<string>();
			const artists = new Set<string>();
			const albums = new Set<string>();

			// Generate 20 of each
			for (let i = 0; i < 20; i++) {
				songs.add(generateSongName());
				artists.add(generateArtistName());
				albums.add(generateAlbumName());
			}

			// Each should have good diversity
			expect(songs.size).toBeGreaterThanOrEqual(15);
			expect(artists.size).toBeGreaterThanOrEqual(15);
			expect(albums.size).toBeGreaterThanOrEqual(15);
		});

		it('should generate names quickly', () => {
			const start = Date.now();

			// Generate 1000 names
			for (let i = 0; i < 1000; i++) {
				generateSongName();
			}

			const elapsed = Date.now() - start;

			// Should complete in under 1 second
			expect(elapsed).toBeLessThan(1000);
		});

		it('should handle rapid consecutive generation', () => {
			clearRecentNames();

			// Generate 100 names rapidly
			const names: string[] = [];
			for (let i = 0; i < 100; i++) {
				names.push(generateSongName());
			}

			// All should be valid
			for (const name of names) {
				expect(name).toBeDefined();
				expect(typeof name).toBe('string');
				expect(name.length).toBeGreaterThan(0);
			}

			// Should have good diversity
			const unique = new Set(names);
			expect(unique.size).toBeGreaterThanOrEqual(80);
		});
	});

	// ========================================================================
	// EDGE CASES
	// ========================================================================

	describe('Edge cases', () => {
		it('should handle cache at exactly 100 names', () => {
			clearRecentNames();

			// Fill cache to exactly 100
			for (let i = 0; i < 100; i++) {
				generateSongName();
			}

			expect(getRecentNamesCount()).toBe(100);

			// Add one more
			generateSongName();

			// Should still be 100
			expect(getRecentNamesCount()).toBe(100);
		});

		it('should never return empty string', () => {
			for (let i = 0; i < 100; i++) {
				const songName = generateSongName();
				const artistName = generateArtistName();
				const albumName = generateAlbumName();

				expect(songName).not.toBe('');
				expect(artistName).not.toBe('');
				expect(albumName).not.toBe('');
			}
		});

		it('should handle cache clearing multiple times', () => {
			generateSongName();
			clearRecentNames();
			expect(getRecentNamesCount()).toBe(0);

			generateSongName();
			clearRecentNames();
			expect(getRecentNamesCount()).toBe(0);

			generateSongName();
			clearRecentNames();
			expect(getRecentNamesCount()).toBe(0);
		});

		it('should handle getRecentNames on empty cache', () => {
			clearRecentNames();

			const recent = getRecentNames();

			expect(Array.isArray(recent)).toBe(true);
			expect(recent.length).toBe(0);
		});
	});
});
