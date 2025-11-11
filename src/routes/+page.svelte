<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { GameEngine } from '$lib/game/engine';
	import { loadGame, saveGame } from '$lib/game/save';
	import { createInitialGameState } from '$lib/game/config';
	import { queueSongs, processSongQueue, calculateMaxAffordable } from '$lib/systems/songs';
	import { generateIncome } from '$lib/systems/income';
	import { generateFans } from '$lib/systems/fans';
	import { generateArtistName } from '$lib/data/names';
	import ResourceBar from '$lib/components/ResourceBar.svelte';
	import type { GameState } from '$lib/game/types';

	// Game state - reactive
	let gameState = $state<GameState>(createInitialGameState());
	let engine: GameEngine | null = null;

	// Initialize game
	onMount(() => {
		// Load saved game or create new
		const saved = loadGame();
		if (saved) {
			gameState = saved;
		} else {
			// Generate artist name for new game
			gameState.currentArtist.name = generateArtistName();
		}

		// Create and start game engine
		engine = new GameEngine(gameState, saveGame);

		// Hook up game loop processors
		const originalTick = (engine as any).tick.bind(engine);
		(engine as any).tick = function() {
			const now = performance.now();
			const deltaTime = (now - (engine as any).lastTickTime) / 1000;
			(engine as any).lastTickTime = now;

			gameState.totalTimePlayed += deltaTime;

			// Process all game systems
			processSongQueue(gameState, deltaTime);
			generateIncome(gameState, deltaTime);
			generateFans(gameState, deltaTime);

			// Auto-save check
			const currentTime = Date.now();
			const timeSinceLastSave = (currentTime - (engine as any).lastSaveTime) / 1000;
			if (timeSinceLastSave >= 10) {
				saveGame(gameState);
				(engine as any).lastSaveTime = currentTime;
			}
		};

		engine.start();
	});

	// Cleanup
	onDestroy(() => {
		if (engine) {
			engine.stop();
		}
	});

	// Button handlers
	function handleQueueSong(count: number) {
		queueSongs(gameState, count);
	}

	function handleQueueMax() {
		const max = calculateMaxAffordable(gameState);
		queueSongs(gameState, max);
	}
</script>

<div class="game-container min-h-screen bg-game-bg text-white p-4">
	<div class="max-w-7xl mx-auto space-y-4">
		<!-- Header -->
		<header class="text-center py-6">
			<h1 class="text-4xl font-bold text-game-accent mb-2">Music Industry Simulator</h1>
			<p class="text-gray-400">Artist: {gameState.currentArtist.name}</p>
		</header>

		<!-- Resource Bar -->
		<ResourceBar bind:gameState={gameState} />

		<!-- Song Generator Panel -->
		<div class="bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800">
			<h2 class="text-2xl font-bold mb-4 text-game-accent">🎵 Generate Songs</h2>

			{#if gameState.currentSongProgress > 0 && gameState.songsInQueue > 0}
				<div class="mb-4">
					<div class="text-sm text-gray-400 mb-2">
						Generating song... {Math.floor(gameState.currentSongProgress * 100)}%
					</div>
					<div class="progress-bar bg-gray-800 rounded-full h-3 overflow-hidden">
						<div
							class="bg-game-accent h-full transition-all duration-100"
							style="width: {gameState.currentSongProgress * 100}%"
						></div>
					</div>
				</div>
			{/if}

			<div class="flex flex-wrap gap-2">
				<button
					onclick={() => handleQueueSong(1)}
					class="px-4 py-2 rounded font-semibold transition-colors bg-[var(--color-game-accent)] hover:bg-blue-600 text-white"
				>
					Generate 1 Song
				</button>
				<button
					onclick={() => handleQueueSong(5)}
					class="px-4 py-2 rounded font-semibold transition-colors bg-[var(--color-game-accent)] hover:bg-blue-600 text-white"
				>
					Generate 5 Songs
				</button>
				<button
					onclick={() => handleQueueSong(10)}
					class="px-4 py-2 rounded font-semibold transition-colors bg-[var(--color-game-accent)] hover:bg-blue-600 text-white"
				>
					Generate 10 Songs
				</button>
				<button
					onclick={handleQueueMax}
					class="px-4 py-2 rounded font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white"
				>
					Generate Max
				</button>
			</div>
		</div>

		<!-- Placeholder for future components -->
		<div class="bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800 opacity-50">
			<p class="text-center text-gray-500">Tech Tree & Upgrades - Coming Soon</p>
		</div>
	</div>
</div>
