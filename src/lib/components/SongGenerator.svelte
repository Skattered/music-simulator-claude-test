<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { queueSongs, calculateMaxAffordable } from '$lib/systems/songs';

	/**
	 * SongGenerator Component
	 *
	 * Displays song generation controls and progress.
	 * Allows players to queue songs in various quantities.
	 */

	interface Props {
		/** Game state (bindable) */
		gameState: GameState;
	}

	let { gameState = $bindable() }: Props = $props();

	/**
	 * Queue a specified number of songs
	 */
	function handleQueueSong(count: number) {
		queueSongs(gameState, count);
	}

	/**
	 * Queue maximum affordable songs
	 */
	function handleQueueMax() {
		const max = calculateMaxAffordable(gameState);
		queueSongs(gameState, max);
	}
</script>

<div class="bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800">
	<h2 class="text-2xl font-bold mb-4 text-game-accent">🎵 Generate Songs</h2>

	<!-- Progress Bar -->
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

	<!-- Queue Status -->
	<div class="mb-4 text-sm text-gray-400">
		{#if gameState.songsInQueue > 0}
			<p>Songs in queue: {gameState.songsInQueue}</p>
		{:else}
			<p>No songs in queue</p>
		{/if}
	</div>

	<!-- Generation Buttons -->
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
