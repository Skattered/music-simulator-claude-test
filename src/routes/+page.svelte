<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { GameEngine } from '$lib/game/engine';
	import { loadGame, saveGame } from '$lib/game/save';
	import { createInitialGameState } from '$lib/game/config';
	import { processSongQueue } from '$lib/systems/songs';
	import { generateIncome } from '$lib/systems/income';
	import { generateFans } from '$lib/systems/fans';
	import { generateArtistName } from '$lib/data/names';
	import ResourceBar from '$lib/components/ResourceBar.svelte';
	import SongGenerator from '$lib/components/SongGenerator.svelte';
	import TechTree from '$lib/components/TechTree.svelte';
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

			// Process advanced systems (imported dynamically to avoid circular deps)
			// Process prestige legacy income
			if (gameState.legacyArtists.length > 0) {
				// applyLegacyIncome would go here
			}

			// Process physical album sales
			if (gameState.activeAlbumBatch) {
				// processAlbumSales would go here
			}

			// Process active tour
			if (gameState.activeTour) {
				// processTour would go here
			}

			// Process exploitation boosts (remove expired)
			if (gameState.activeBoosts.length > 0) {
				gameState.activeBoosts = gameState.activeBoosts.filter((b) => b.expiresAt > Date.now());
			}

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
		<SongGenerator bind:gameState={gameState} />

		<!-- Tech Tree Panel -->
		<TechTree bind:gameState={gameState} />

		<!-- Placeholder for future features -->
		<div class="bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800 opacity-50">
			<p class="text-center text-gray-500">
				Advanced Features (Physical Albums, Tours, Exploitation) - Coming Soon
			</p>
		</div>
	</div>
</div>
