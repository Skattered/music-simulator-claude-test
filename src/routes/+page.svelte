<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { GameEngine } from '$lib/game/engine';
	import { loadGame, saveGame, deleteSave } from '$lib/game/save';
	import { createInitialGameState, UNLOCK_PHYSICAL_ALBUMS, UNLOCK_TOURS } from '$lib/game/config';
	import { queueSongs, processSongQueue } from '$lib/systems/songs';
	import { generateIncome } from '$lib/systems/income';
	import { generateFans, calculateLegacyFanContribution } from '$lib/systems/fans';
	import { processAlbumSales } from '$lib/systems/physical-albums';
	import { processTour } from '$lib/systems/tours';
	import { processBoosts } from '$lib/systems/exploitation';
	import { generateArtistName } from '$lib/data/names';
	import type { GameState } from '$lib/game/types';
	import type { ToastMessage } from '$lib/components/Toast.svelte';

	// Components
	import ResourceBar from '$lib/components/ResourceBar.svelte';
	import SongGenerator from '$lib/components/SongGenerator.svelte';
	import TechTree from '$lib/components/TechTree.svelte';
	import PhysicalAlbums from '$lib/components/PhysicalAlbums.svelte';
	import TourManager from '$lib/components/TourManager.svelte';
	import ExploitationPanel from '$lib/components/ExploitationPanel.svelte';
	import PrestigeModal from '$lib/components/PrestigeModal.svelte';
	import VictoryScreen from '$lib/components/VictoryScreen.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	// Game state - reactive
	let gameState = $state<GameState>(createInitialGameState());
	let engine: GameEngine | null = null;

	// UI state
	let showPrestigeModal = $state(false);
	let showVictory = $state(false);
	let toasts = $state<ToastMessage[]>([]);

	// Check unlock conditions
	$effect(() => {
		// Physical albums unlock
		if (!gameState.unlockedSystems.physicalAlbums &&
			gameState.totalCompletedSongs >= UNLOCK_PHYSICAL_ALBUMS.songs &&
			gameState.currentArtist.fans >= UNLOCK_PHYSICAL_ALBUMS.fans &&
			gameState.money >= UNLOCK_PHYSICAL_ALBUMS.money) {
			gameState.unlockedSystems.physicalAlbums = true;
			addToast('Physical Albums Unlocked! 💿', 'success');
			gameState.industryControl += 5;
		}

		// Tours unlock
		if (!gameState.unlockedSystems.tours &&
			gameState.totalAlbumsReleased >= UNLOCK_TOURS.albums &&
			gameState.currentArtist.fans >= UNLOCK_TOURS.fans &&
			gameState.currentTechTier >= UNLOCK_TOURS.techTier) {
			gameState.unlockedSystems.tours = true;
			addToast('Tours & Concerts Unlocked! 🎸', 'success');
			gameState.industryControl += 8;
		}

		// Victory condition
		if (gameState.industryControl >= 100 && !showVictory) {
			showVictory = true;
		}
	});

	// Initialize game
	onMount(() => {
		const saved = loadGame();
		if (saved) {
			gameState = saved;
		} else {
			gameState.currentArtist.name = generateArtistName();
		}

		engine = new GameEngine(gameState, saveGame);

		// Override tick to include all processors
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

			// Add legacy fan contribution
			const legacyFans = calculateLegacyFanContribution(gameState);
			gameState.currentArtist.fans += legacyFans * deltaTime;

			processAlbumSales(gameState, deltaTime);
			processTour(gameState);
			processBoosts(gameState);

			// Auto-save
			const currentTime = Date.now();
			const timeSinceLastSave = (currentTime - (engine as any).lastSaveTime) / 1000;
			if (timeSinceLastSave >= 10) {
				saveGame(gameState);
				(engine as any).lastSaveTime = currentTime;
			}
		};

		engine.start();
	});

	onDestroy(() => {
		if (engine) {
			engine.stop();
		}
	});

	function addToast(message: string, type: ToastMessage['type'], duration = 3000) {
		const id = `toast-${Date.now()}-${Math.random()}`;
		toasts = [...toasts, { id, message, type, duration }];
	}

	function handleNewGame() {
		if (confirm('Start a completely new game? This will delete your current save!')) {
			deleteSave();
			location.reload();
		}
	}

	function handleContinue() {
		showVictory = false;
	}
</script>

<div class="game-container min-h-screen bg-game-bg text-white p-4">
	<div class="max-w-7xl mx-auto space-y-4">
		<!-- Header -->
		<header class="text-center py-6">
			<h1 class="text-4xl font-bold text-game-accent mb-2">Music Industry Simulator</h1>
			<p class="text-gray-400">Artist: {gameState.currentArtist.name}</p>
			{#if gameState.unlockedSystems.prestige}
				<button
					onclick={() => showPrestigeModal = true}
					class="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
				>
					🌟 Create New Artist
				</button>
			{/if}
		</header>

		<!-- Resource Bar -->
		<ResourceBar bind:gameState={gameState} />

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<!-- Left Column -->
			<div class="space-y-4">
				<SongGenerator bind:gameState={gameState} />
				<TechTree bind:gameState={gameState} />

				{#if gameState.unlockedSystems.physicalAlbums}
					<PhysicalAlbums bind:gameState={gameState} />
				{/if}
			</div>

			<!-- Right Column -->
			<div class="space-y-4">
				<ExploitationPanel bind:gameState={gameState} />

				{#if gameState.unlockedSystems.tours}
					<TourManager bind:gameState={gameState} />
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Modals and Overlays -->
{#if showPrestigeModal}
	<PrestigeModal
		bind:gameState={gameState}
		bind:isOpen={showPrestigeModal}
		onClose={() => showPrestigeModal = false}
	/>
{/if}

{#if showVictory}
	<VictoryScreen
		{gameState}
		onNewGame={handleNewGame}
		onContinue={handleContinue}
	/>
{/if}

<!-- Toast Notifications -->
<ToastContainer bind:toasts={toasts} />
