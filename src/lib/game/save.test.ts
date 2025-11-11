/**
 * Unit tests for Save/Load System
 *
 * Tests localStorage persistence, validation, backup, and import/export
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	saveGame,
	loadGame,
	loadBackup,
	validateSave,
	deleteSave,
	exportSave,
	importSave
} from './save';
import { createInitialGameState, SAVE_KEY, BACKUP_KEY, GAME_VERSION } from './config';
import type { GameState, SaveFile } from './types';

describe('Save/Load System', () => {
	let state: GameState;

	beforeEach(() => {
		// Create fresh state for each test
		state = createInitialGameState();

		// Clear localStorage before each test
		localStorage.clear();
	});

	afterEach(() => {
		// Clean up localStorage after each test
		localStorage.clear();
	});

	describe('saveGame()', () => {
		it('should save game state to localStorage', () => {
			const success = saveGame(state);

			expect(success).toBe(true);
			expect(localStorage.getItem(SAVE_KEY)).toBeTruthy();
		});

		it('should include metadata in save file', () => {
			const originalMoney = state.money;
			saveGame(state);

			const saveData = localStorage.getItem(SAVE_KEY);
			expect(saveData).toBeTruthy();

			const saveFile: SaveFile = JSON.parse(saveData!);
			expect(saveFile.state.money).toBe(originalMoney);
			expect(saveFile.version).toBe(GAME_VERSION);
			expect(saveFile.savedAt).toBeTypeOf('number');
		});

		it('should backup previous save before overwriting', () => {
			// Save first time
			const state1 = createInitialGameState();
			state1.money = 100;
			saveGame(state1);

			// Save second time with different data
			const state2 = createInitialGameState();
			state2.money = 200;
			saveGame(state2);

			// Check that backup contains first save
			const backupData = localStorage.getItem(BACKUP_KEY);
			expect(backupData).toBeTruthy();

			const backupFile: SaveFile = JSON.parse(backupData!);
			expect(backupFile.state.money).toBe(100);
		});

		it('should update lastSaveTime in state', () => {
			vi.useFakeTimers();
			const beforeSave = state.lastSaveTime;

			vi.advanceTimersByTime(100); // Advance time by 100ms
			saveGame(state);
			const afterSave = state.lastSaveTime;

			expect(afterSave).toBeGreaterThan(beforeSave);
			vi.useRealTimers();
		});

		it('should handle storage quota exceeded', () => {
			// Mock localStorage.setItem to throw QuotaExceededError
			const originalSetItem = localStorage.setItem;
			const setItemSpy = vi
				.spyOn(localStorage, 'setItem')
				.mockImplementationOnce(() => {
					const error = new DOMException('Quota exceeded', 'QuotaExceededError');
					throw error;
				})
				.mockImplementationOnce(() => {
					// Second call succeeds after removing backup
					originalSetItem.call(localStorage, SAVE_KEY, JSON.stringify({ test: 'data' }));
				});

			const success = saveGame(state);

			// Should still succeed after removing backup
			expect(success).toBe(true);
			setItemSpy.mockRestore();
		});
	});

	describe('loadGame()', () => {
		it('should load saved game state', () => {
			// Save a state
			state.money = 500;
			state.totalCompletedSongs = 10;
			saveGame(state);

			// Load it back
			const loadedState = loadGame();

			expect(loadedState).toBeTruthy();
			expect(loadedState!.money).toBe(500);
			expect(loadedState!.totalCompletedSongs).toBe(10);
		});

		it('should return null when no save exists', () => {
			const loadedState = loadGame();
			expect(loadedState).toBeNull();
		});

		it('should fallback to backup if primary save is corrupted', () => {
			// Save valid state to backup
			state.money = 100;
			const validSave: SaveFile = {
				state: state,
				savedAt: Date.now(),
				version: GAME_VERSION
			};
			localStorage.setItem(BACKUP_KEY, JSON.stringify(validSave));

			// Set corrupted primary save
			localStorage.setItem(SAVE_KEY, 'invalid json {{{');

			// Should load from backup
			const loadedState = loadGame();
			expect(loadedState).toBeTruthy();
			expect(loadedState!.money).toBe(100);
		});

		it('should warn about version mismatch but load anyway', () => {
			const consoleSpy = vi.spyOn(console, 'warn');

			// Save with different version
			const saveFile: SaveFile = {
				state: state,
				savedAt: Date.now(),
				version: '0.9.0' // Different version
			};
			localStorage.setItem(SAVE_KEY, JSON.stringify(saveFile));

			const loadedState = loadGame();

			expect(loadedState).toBeTruthy();
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Save version mismatch')
			);
		});
	});

	describe('loadBackup()', () => {
		it('should load backup save', () => {
			state.money = 250;
			const saveFile: SaveFile = {
				state: state,
				savedAt: Date.now(),
				version: GAME_VERSION
			};
			localStorage.setItem(BACKUP_KEY, JSON.stringify(saveFile));

			const loadedState = loadBackup();

			expect(loadedState).toBeTruthy();
			expect(loadedState!.money).toBe(250);
		});

		it('should return null when no backup exists', () => {
			const loadedState = loadBackup();
			expect(loadedState).toBeNull();
		});

		it('should return null if backup is also corrupted', () => {
			localStorage.setItem(BACKUP_KEY, 'invalid json');

			const loadedState = loadBackup();
			expect(loadedState).toBeNull();
		});
	});

	describe('validateSave()', () => {
		it('should validate correct game state', () => {
			expect(validateSave(state)).toBe(true);
		});

		it('should reject null', () => {
			expect(validateSave(null)).toBe(false);
		});

		it('should reject non-objects', () => {
			expect(validateSave('string')).toBe(false);
			expect(validateSave(123)).toBe(false);
			expect(validateSave([])).toBe(false);
		});

		it('should reject state missing required properties', () => {
			const invalidState = { money: 100 }; // Missing most properties
			expect(validateSave(invalidState)).toBe(false);
		});

		it('should reject state with invalid currentArtist', () => {
			const invalidState = { ...state, currentArtist: null };
			expect(validateSave(invalidState)).toBe(false);
		});

		it('should reject state with invalid songsInQueue type', () => {
			const invalidState = { ...state, songsInQueue: 'not a number' };
			expect(validateSave(invalidState)).toBe(false);
		});

		it('should reject state with negative money', () => {
			const invalidState = { ...state, money: -100 };
			expect(validateSave(invalidState)).toBe(false);
		});

		it('should reject state with invalid industryControl', () => {
			const invalidState1 = { ...state, industryControl: -10 };
			const invalidState2 = { ...state, industryControl: 150 };

			expect(validateSave(invalidState1)).toBe(false);
			expect(validateSave(invalidState2)).toBe(false);
		});

		it('should reject state with NaN or Infinity values', () => {
			const invalidState1 = { ...state, money: NaN };
			const invalidState2 = { ...state, money: Infinity };

			expect(validateSave(invalidState1)).toBe(false);
			expect(validateSave(invalidState2)).toBe(false);
		});
	});

	describe('deleteSave()', () => {
		it('should delete both primary and backup saves', () => {
			saveGame(state);
			// Create backup by saving twice
			state.money = 200;
			saveGame(state);

			expect(localStorage.getItem(SAVE_KEY)).toBeTruthy();
			expect(localStorage.getItem(BACKUP_KEY)).toBeTruthy();

			deleteSave();

			expect(localStorage.getItem(SAVE_KEY)).toBeNull();
			expect(localStorage.getItem(BACKUP_KEY)).toBeNull();
		});
	});

	describe('exportSave()', () => {
		it('should export save as JSON string', () => {
			saveGame(state);

			const exported = exportSave();

			expect(exported).toBeTruthy();
			expect(typeof exported).toBe('string');

			// Should be valid JSON
			const parsed = JSON.parse(exported!);
			expect(parsed.state).toBeTruthy();
			expect(parsed.version).toBe(GAME_VERSION);
		});

		it('should return null when no save exists', () => {
			const exported = exportSave();
			expect(exported).toBeNull();
		});

		it('should format JSON for readability', () => {
			saveGame(state);

			const exported = exportSave();

			// Formatted JSON should contain newlines and indentation
			expect(exported).toContain('\n');
			expect(exported).toContain('  '); // 2-space indent
		});
	});

	describe('importSave()', () => {
		it('should import valid save JSON', () => {
			state.money = 999;
			const saveFile: SaveFile = {
				state: state,
				savedAt: Date.now(),
				version: GAME_VERSION
			};
			const jsonString = JSON.stringify(saveFile);

			const success = importSave(jsonString);

			expect(success).toBe(true);

			// Verify it was saved
			const loadedState = loadGame();
			expect(loadedState!.money).toBe(999);
		});

		it('should reject invalid JSON', () => {
			const success = importSave('invalid json {{{');
			expect(success).toBe(false);
		});

		it('should reject save that fails validation', () => {
			const invalidSave = {
				state: { money: 'invalid' }, // Invalid state
				savedAt: Date.now(),
				version: GAME_VERSION
			};
			const jsonString = JSON.stringify(invalidSave);

			const success = importSave(jsonString);
			expect(success).toBe(false);
		});

		it('should backup current save before importing', () => {
			// Save current state
			state.money = 100;
			saveGame(state);

			// Import new state
			const newState = createInitialGameState();
			newState.money = 200;
			const saveFile: SaveFile = {
				state: newState,
				savedAt: Date.now(),
				version: GAME_VERSION
			};
			importSave(JSON.stringify(saveFile));

			// Backup should contain original state
			const backupData = localStorage.getItem(BACKUP_KEY);
			expect(backupData).toBeTruthy();

			const backupFile: SaveFile = JSON.parse(backupData!);
			expect(backupFile.state.money).toBe(100);
		});
	});

	describe('save/load integration', () => {
		it('should preserve all game state through save/load cycle', () => {
			// Modify state in various ways
			state.money = 5000;
			state.gpu = 100;
			state.totalCompletedSongs = 50;
			state.songsInQueue = 5;
			state.currentSongProgress = 0.5;
			state.currentTechTier = 3;
			state.industryControl = 25.5;
			state.currentArtist.name = 'Test Artist';
			state.currentArtist.fans = 10000;

			// Save and load
			saveGame(state);
			const loadedState = loadGame();

			// Verify all properties preserved
			expect(loadedState).toBeTruthy();
			expect(loadedState!.money).toBe(5000);
			expect(loadedState!.gpu).toBe(100);
			expect(loadedState!.totalCompletedSongs).toBe(50);
			expect(loadedState!.songsInQueue).toBe(5);
			expect(loadedState!.currentSongProgress).toBe(0.5);
			expect(loadedState!.currentTechTier).toBe(3);
			expect(loadedState!.industryControl).toBe(25.5);
			expect(loadedState!.currentArtist.name).toBe('Test Artist');
			expect(loadedState!.currentArtist.fans).toBe(10000);
		});
	});
});
