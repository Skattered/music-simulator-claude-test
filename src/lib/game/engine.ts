/**
 * Music Industry Simulator - Game Engine
 *
 * Core game loop that runs at 10 ticks per second (TPS).
 * Handles frame-independent game logic using deltaTime.
 *
 * The engine is responsible for:
 * - Running the game loop at consistent intervals
 * - Calculating deltaTime for frame-independent updates
 * - Auto-saving game state periodically
 * - Managing start/stop lifecycle
 *
 * IMPORTANT: All game logic should use deltaTime to ensure
 * consistent behavior regardless of frame rate variations.
 */

import type { GameState } from './types';
import { TICK_RATE, AUTO_SAVE_INTERVAL, secondsToMs } from './config';

/**
 * GameEngine class manages the core game loop
 *
 * Usage:
 * ```typescript
 * const state = createInitialGameState();
 * const engine = new GameEngine(state, saveCallback);
 * engine.start();
 * // ... game runs ...
 * engine.stop(); // Stops and auto-saves
 * ```
 */
export class GameEngine {
	/** Game state reference */
	private state: GameState;

	/** Save callback function */
	private saveCallback: (state: GameState) => void;

	/** Interval ID for the game loop */
	private intervalId: number | null = null;

	/** Last tick timestamp for deltaTime calculation */
	private lastTickTime: number = 0;

	/** Timestamp of last auto-save */
	private lastSaveTime: number = 0;

	/** Is the engine currently running? */
	private running: boolean = false;

	/**
	 * Creates a new GameEngine instance
	 *
	 * @param state - Game state to manage
	 * @param saveCallback - Function called to save game state
	 */
	constructor(state: GameState, saveCallback: (state: GameState) => void) {
		this.state = state;
		this.saveCallback = saveCallback;
	}

	/**
	 * Starts the game loop
	 *
	 * Initializes the interval at TICK_RATE (100ms = 10 TPS)
	 * and begins running game logic every tick.
	 */
	start(): void {
		if (this.running) {
			console.warn('GameEngine is already running');
			return;
		}

		this.running = true;
		this.lastTickTime = performance.now();
		this.lastSaveTime = Date.now();

		// Start game loop at 10 TPS (100ms intervals)
		this.intervalId = window.setInterval(() => {
			this.tick();
		}, secondsToMs(TICK_RATE)) as unknown as number;

		console.log('GameEngine started');
	}

	/**
	 * Stops the game loop and auto-saves
	 *
	 * Clears the interval and saves game state before stopping.
	 * This prevents data loss when closing the game.
	 */
	stop(): void {
		if (!this.running) {
			return;
		}

		this.running = false;

		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}

		// Save before stopping to prevent data loss
		this.saveCallback(this.state);
		console.log('GameEngine stopped and saved');
	}

	/**
	 * Main game loop tick
	 *
	 * Called every 100ms (10 times per second).
	 * Calculates deltaTime and calls all game system processors.
	 *
	 * IMPORTANT: Uses deltaTime for frame-independent logic.
	 * All systems should scale their calculations by deltaTime.
	 */
	private tick(): void {
		// Calculate deltaTime in seconds since last tick
		const now = performance.now();
		const deltaTime = (now - this.lastTickTime) / 1000; // Convert to seconds
		this.lastTickTime = now;

		// Update total time played
		this.state.totalTimePlayed += deltaTime;

		// Process all game systems here
		// TODO: These will be implemented in subsequent tasks
		// - processSongQueue(this.state, deltaTime)
		// - generateIncome(this.state, deltaTime)
		// - generateFans(this.state, deltaTime)
		// - processActiveBoosts(this.state, deltaTime)
		// - processPhysicalAlbums(this.state, deltaTime)
		// - processTours(this.state, deltaTime)
		// - processLegacyArtists(this.state, deltaTime)
		// - processPlatformIncome(this.state, deltaTime)
		// - updateControlProgress(this.state)

		// Auto-save every AUTO_SAVE_INTERVAL seconds
		const currentTime = Date.now();
		const timeSinceLastSave = (currentTime - this.lastSaveTime) / 1000;

		if (timeSinceLastSave >= AUTO_SAVE_INTERVAL) {
			this.saveCallback(this.state);
			this.lastSaveTime = currentTime;
			console.log('Auto-saved game state');
		}
	}

	/**
	 * Gets the current running status
	 *
	 * @returns True if engine is running, false otherwise
	 */
	isRunning(): boolean {
		return this.running;
	}

	/**
	 * Gets the current game state
	 *
	 * @returns Current GameState reference
	 */
	getState(): GameState {
		return this.state;
	}
}
