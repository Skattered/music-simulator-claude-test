/**
 * Music Industry Simulator - Save/Load System
 *
 * Handles game state persistence using localStorage.
 * Includes backup system, validation, and import/export functionality.
 *
 * Features:
 * - Auto-save to localStorage
 * - Backup system (keeps previous save before overwriting)
 * - Save validation to prevent corrupted data
 * - Export/import for manual backups
 * - Graceful error handling for storage quota exceeded
 *
 * IMPORTANT: Always validate saves before loading to prevent crashes
 * from corrupted or outdated save data.
 */

import type { GameState, SaveFile } from './types';
import { SAVE_KEY, BACKUP_KEY, GAME_VERSION } from './config';

/**
 * Saves game state to localStorage
 *
 * Creates a backup of the previous save before overwriting.
 * This ensures we can recover from corrupted saves.
 *
 * @param state - Game state to save
 * @returns True if save succeeded, false if failed
 *
 * @example
 * ```typescript
 * const success = saveGame(gameState);
 * if (!success) {
 *   console.error('Failed to save game');
 * }
 * ```
 */
export function saveGame(state: GameState): boolean {
	try {
		// Create save file with metadata
		const saveFile: SaveFile = {
			state: state,
			savedAt: Date.now(),
			version: GAME_VERSION
		};

		// Backup current save before overwriting
		const currentSave = localStorage.getItem(SAVE_KEY);
		if (currentSave) {
			localStorage.setItem(BACKUP_KEY, currentSave);
		}

		// Save new state
		const saveData = JSON.stringify(saveFile);
		localStorage.setItem(SAVE_KEY, saveData);

		// Update last save time in state
		state.lastSaveTime = Date.now();

		return true;
	} catch (error) {
		// Handle quota exceeded or other localStorage errors
		console.error('Failed to save game:', error);

		// If error is quota exceeded, try deleting backup to free space
		if (error instanceof DOMException && error.name === 'QuotaExceededError') {
			try {
				localStorage.removeItem(BACKUP_KEY);
				const saveFile: SaveFile = {
					state: state,
					savedAt: Date.now(),
					version: GAME_VERSION
				};
				const saveData = JSON.stringify(saveFile);
				localStorage.setItem(SAVE_KEY, saveData);
				console.warn('Saved after removing backup due to storage quota');
				return true;
			} catch (retryError) {
				console.error('Failed to save even after removing backup:', retryError);
				return false;
			}
		}

		return false;
	}
}

/**
 * Loads game state from localStorage
 *
 * Validates the save before loading. If validation fails,
 * attempts to load from backup instead.
 *
 * @returns GameState if load succeeded, null if no valid save found
 *
 * @example
 * ```typescript
 * const state = loadGame();
 * if (state) {
 *   // Use loaded state
 * } else {
 *   // Create new game
 * }
 * ```
 */
export function loadGame(): GameState | null {
	try {
		const saveData = localStorage.getItem(SAVE_KEY);
		if (!saveData) {
			return null;
		}

		const saveFile = JSON.parse(saveData) as SaveFile;

		// Validate save structure
		if (!validateSave(saveFile.state)) {
			console.warn('Primary save failed validation, trying backup...');
			return loadBackup();
		}

		// Check version compatibility
		if (saveFile.version !== GAME_VERSION) {
			console.warn(
				`Save version mismatch: ${saveFile.version} vs ${GAME_VERSION}. Attempting to load anyway...`
			);
		}

		return saveFile.state;
	} catch (error) {
		console.error('Failed to load game:', error);
		// Try backup if primary fails
		return loadBackup();
	}
}

/**
 * Loads game state from backup
 *
 * Used when primary save is corrupted or fails validation.
 *
 * @returns GameState from backup if available, null otherwise
 */
export function loadBackup(): GameState | null {
	try {
		const backupData = localStorage.getItem(BACKUP_KEY);
		if (!backupData) {
			console.warn('No backup save available');
			return null;
		}

		const saveFile = JSON.parse(backupData) as SaveFile;

		// Validate backup
		if (!validateSave(saveFile.state)) {
			console.error('Backup save also failed validation');
			return null;
		}

		console.log('Successfully loaded from backup');
		return saveFile.state;
	} catch (error) {
		console.error('Failed to load backup:', error);
		return null;
	}
}

/**
 * Validates that a loaded object is a valid GameState
 *
 * Type guard function that checks for required properties.
 * Prevents crashes from corrupted or outdated saves.
 *
 * @param state - Object to validate
 * @returns True if state is valid GameState
 *
 * @example
 * ```typescript
 * const data = JSON.parse(savedData);
 * if (validateSave(data)) {
 *   // data is now typed as GameState
 *   useGameState(data);
 * }
 * ```
 */
export function validateSave(state: any): state is GameState {
	if (!state || typeof state !== 'object') {
		return false;
	}

	// Check required top-level properties
	const requiredProps = [
		'version',
		'money',
		'currentArtist',
		'totalCompletedSongs',
		'songsInQueue',
		'currentTechTier',
		'purchasedUpgrades',
		'industryControl',
		'unlockedSystems'
	];

	for (const prop of requiredProps) {
		if (!(prop in state)) {
			console.error(`Save validation failed: missing property '${prop}'`);
			return false;
		}
	}

	// Validate currentArtist structure
	if (
		!state.currentArtist ||
		typeof state.currentArtist.name !== 'string' ||
		typeof state.currentArtist.totalSongs !== 'number' ||
		typeof state.currentArtist.fans !== 'number'
	) {
		console.error('Save validation failed: invalid currentArtist structure');
		return false;
	}

	// Validate song queue (should be a number)
	if (typeof state.songsInQueue !== 'number' || state.songsInQueue < 0) {
		console.error('Save validation failed: songsInQueue is not a valid number');
		return false;
	}

	if (!Array.isArray(state.purchasedUpgrades)) {
		console.error('Save validation failed: purchasedUpgrades is not an array');
		return false;
	}

	if (!Array.isArray(state.legacyArtists)) {
		console.error('Save validation failed: legacyArtists is not an array');
		return false;
	}

	// Validate numeric ranges
	if (state.money < 0 || !isFinite(state.money)) {
		console.error('Save validation failed: invalid money value');
		return false;
	}

	if (
		state.industryControl < 0 ||
		state.industryControl > 100 ||
		!isFinite(state.industryControl)
	) {
		console.error('Save validation failed: invalid industryControl value');
		return false;
	}

	// All validation checks passed
	return true;
}

/**
 * Deletes all save data from localStorage
 *
 * Removes both primary save and backup.
 * Use with caution - this cannot be undone!
 */
export function deleteSave(): void {
	try {
		localStorage.removeItem(SAVE_KEY);
		localStorage.removeItem(BACKUP_KEY);
		console.log('Save data deleted');
	} catch (error) {
		console.error('Failed to delete save:', error);
	}
}

/**
 * Exports save data as JSON string
 *
 * Creates a downloadable backup that can be imported later.
 * Useful for manual backups or transferring saves between devices.
 *
 * @returns JSON string of save data, or null if no save exists
 *
 * @example
 * ```typescript
 * const saveJson = exportSave();
 * if (saveJson) {
 *   // Create download link
 *   const blob = new Blob([saveJson], { type: 'application/json' });
 *   const url = URL.createObjectURL(blob);
 *   // Trigger download...
 * }
 * ```
 */
export function exportSave(): string | null {
	try {
		const saveData = localStorage.getItem(SAVE_KEY);
		if (!saveData) {
			console.warn('No save data to export');
			return null;
		}

		// Return formatted JSON for readability
		const saveFile = JSON.parse(saveData);
		return JSON.stringify(saveFile, null, 2);
	} catch (error) {
		console.error('Failed to export save:', error);
		return null;
	}
}

/**
 * Imports save data from JSON string
 *
 * Validates the imported data before saving.
 * Creates a backup of current save before importing.
 *
 * @param fileContent - JSON string containing save data
 * @returns True if import succeeded, false if failed
 *
 * @example
 * ```typescript
 * const fileInput = document.getElementById('file-input');
 * fileInput.addEventListener('change', async (e) => {
 *   const file = e.target.files[0];
 *   const content = await file.text();
 *   const success = importSave(content);
 *   if (success) {
 *     // Reload game with imported save
 *   }
 * });
 * ```
 */
export function importSave(fileContent: string): boolean {
	try {
		const saveFile = JSON.parse(fileContent) as SaveFile;

		// Validate imported save
		if (!validateSave(saveFile.state)) {
			console.error('Imported save failed validation');
			return false;
		}

		// Backup current save before importing
		const currentSave = localStorage.getItem(SAVE_KEY);
		if (currentSave) {
			localStorage.setItem(BACKUP_KEY, currentSave);
		}

		// Save imported data
		const saveData = JSON.stringify(saveFile);
		localStorage.setItem(SAVE_KEY, saveData);

		console.log('Save imported successfully');
		return true;
	} catch (error) {
		console.error('Failed to import save:', error);
		return false;
	}
}
