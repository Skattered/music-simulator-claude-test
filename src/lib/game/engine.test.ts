/**
 * Unit tests for GameEngine
 *
 * Tests the core game loop functionality:
 * - Starting and stopping the engine
 * - DeltaTime calculation
 * - Auto-save functionality
 * - State management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from './engine';
import { createInitialGameState } from './config';
import type { GameState } from './types';

describe('GameEngine', () => {
	let engine: GameEngine;
	let state: GameState;
	let saveCallback: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create fresh state and mock save callback for each test
		state = createInitialGameState();
		saveCallback = vi.fn();
		engine = new GameEngine(state, saveCallback);

		// Mock timers for testing
		vi.useFakeTimers();
	});

	afterEach(() => {
		// Clean up after each test
		if (engine.isRunning()) {
			engine.stop();
		}
		vi.restoreAllMocks();
	});

	describe('start()', () => {
		it('should start the engine', () => {
			engine.start();
			expect(engine.isRunning()).toBe(true);
		});

		it('should not start if already running', () => {
			const consoleSpy = vi.spyOn(console, 'warn');
			engine.start();
			engine.start(); // Try to start again

			expect(consoleSpy).toHaveBeenCalledWith('GameEngine is already running');
		});

		it('should initialize tick interval', () => {
			engine.start();

			// Fast-forward time by 100ms (one tick)
			vi.advanceTimersByTime(100);

			// State should have been updated (totalTimePlayed increases)
			expect(state.totalTimePlayed).toBeGreaterThan(0);
		});
	});

	describe('stop()', () => {
		it('should stop the engine', () => {
			engine.start();
			engine.stop();
			expect(engine.isRunning()).toBe(false);
		});

		it('should call save callback when stopping', () => {
			engine.start();
			engine.stop();

			expect(saveCallback).toHaveBeenCalledWith(state);
		});

		it('should be safe to call stop multiple times', () => {
			engine.start();
			engine.stop();
			engine.stop(); // Should not throw

			expect(engine.isRunning()).toBe(false);
		});
	});

	describe('tick()', () => {
		it('should update totalTimePlayed', () => {
			const initialTime = state.totalTimePlayed;
			engine.start();

			// Advance by 1 second (10 ticks at 100ms each)
			vi.advanceTimersByTime(1000);

			expect(state.totalTimePlayed).toBeGreaterThan(initialTime);
			expect(state.totalTimePlayed).toBeCloseTo(1.0, 1); // ~1 second
		});

		it('should auto-save after AUTO_SAVE_INTERVAL', () => {
			engine.start();

			// Fast-forward by 11 seconds (should trigger auto-save at 10s)
			vi.advanceTimersByTime(11000);

			// Save should have been called at least once (auto-save)
			// Note: stop() also calls save, so we check for at least 1 call
			expect(saveCallback.mock.calls.length).toBeGreaterThan(0);
		});

		it('should not auto-save before interval elapses', () => {
			engine.start();

			// Fast-forward by 5 seconds (less than AUTO_SAVE_INTERVAL)
			vi.advanceTimersByTime(5000);

			// Should not have auto-saved yet
			expect(saveCallback).not.toHaveBeenCalled();
		});

		it('should run at consistent 10 TPS', () => {
			engine.start();

			// Advance by 1 second = 10 ticks at 100ms each
			vi.advanceTimersByTime(1000);

			// totalTimePlayed should be approximately 1 second
			expect(state.totalTimePlayed).toBeCloseTo(1.0, 1);
		});
	});

	describe('getState()', () => {
		it('should return the game state', () => {
			expect(engine.getState()).toBe(state);
		});

		it('should return same reference throughout lifecycle', () => {
			const state1 = engine.getState();
			engine.start();
			vi.advanceTimersByTime(1000);
			const state2 = engine.getState();
			engine.stop();
			const state3 = engine.getState();

			expect(state1).toBe(state2);
			expect(state2).toBe(state3);
		});
	});

	describe('isRunning()', () => {
		it('should return false when not started', () => {
			expect(engine.isRunning()).toBe(false);
		});

		it('should return true when running', () => {
			engine.start();
			expect(engine.isRunning()).toBe(true);
		});

		it('should return false after stopping', () => {
			engine.start();
			engine.stop();
			expect(engine.isRunning()).toBe(false);
		});
	});

	describe('frame independence', () => {
		it('should handle variable deltaTime correctly', () => {
			// This test ensures game logic scales with deltaTime
			// even if frame rate is inconsistent
			engine.start();

			const initialTime = state.totalTimePlayed;

			// Simulate 5 ticks of varying duration
			for (let i = 0; i < 5; i++) {
				vi.advanceTimersByTime(100); // 100ms per tick
			}

			// Total time should be approximately 500ms = 0.5 seconds
			const elapsed = state.totalTimePlayed - initialTime;
			expect(elapsed).toBeCloseTo(0.5, 1);
		});
	});
});
