<!--
  Physical Albums Component

  Displays physical album sales and management.
  Allows player to press albums and track sales.
-->
<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { formatMoney, formatNumber, formatDuration } from '$lib/game/utils';
	import { pressAlbum, canPressAlbum } from '$lib/systems/physical-albums';
	import { generateAlbumName } from '$lib/data/names';

	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Derived values
	const canPress = $derived(canPressAlbum(gameState));
	const hasActiveAlbum = $derived(gameState.activeAlbumBatch !== null);

	// Calculate time since last album
	const timeSinceLastAlbum = $derived(() => {
		if (gameState.lastAlbumTimestamp === 0) return 0;
		return Date.now() - gameState.lastAlbumTimestamp;
	});

	function handlePressAlbum() {
		const albumName = generateAlbumName();
		pressAlbum(gameState, 1000, albumName); // Press 1000 copies default
	}
</script>

{#if gameState.unlockedSystems.physicalAlbums}
	<div class="physical-albums bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800">
		<h2 class="text-2xl font-bold mb-4 text-game-accent flex items-center gap-2">
			💿 Physical Albums
		</h2>

		{#if hasActiveAlbum && gameState.activeAlbumBatch}
			<!-- Active Album Display -->
			<div class="active-album bg-gray-800 p-4 rounded-lg mb-4">
				<div class="flex justify-between items-start mb-2">
					<div>
						<h3 class="text-lg font-bold text-blue-400">{gameState.activeAlbumBatch.name}</h3>
						<p class="text-sm text-gray-400">
							Released: {new Date(gameState.activeAlbumBatch.releaseTime).toLocaleDateString()}
						</p>
					</div>
					<div class="text-right">
						<p class="text-xl font-bold text-green-400">
							{formatMoney(gameState.activeAlbumBatch.revenueGenerated)}
						</p>
						<p class="text-xs text-gray-400">Revenue</p>
					</div>
				</div>

				<div class="grid grid-cols-3 gap-2 text-sm">
					<div>
						<p class="text-gray-400">Copies Pressed</p>
						<p class="font-bold">{formatNumber(gameState.activeAlbumBatch.copiesPressed)}</p>
					</div>
					<div>
						<p class="text-gray-400">Copies Remaining</p>
						<p class="font-bold">{formatNumber(gameState.activeAlbumBatch.copiesRemaining)}</p>
					</div>
					<div>
						<p class="text-gray-400">Price Per Copy</p>
						<p class="font-bold">{formatMoney(gameState.activeAlbumBatch.pricePerCopy)}</p>
					</div>
				</div>

				<!-- Progress bar for remaining copies -->
				<div class="mt-3">
					<div class="flex justify-between text-xs text-gray-400 mb-1">
						<span>Inventory</span>
						<span>{Math.floor((gameState.activeAlbumBatch.copiesRemaining / gameState.activeAlbumBatch.copiesPressed) * 100)}%</span>
					</div>
					<div class="bg-gray-700 rounded-full h-2">
						<div
							class="bg-purple-500 h-2 rounded-full transition-all duration-300"
							style="width: {(gameState.activeAlbumBatch.copiesRemaining / gameState.activeAlbumBatch.copiesPressed) * 100}%"
						></div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Press Album Button -->
		<div class="press-section">
			{#if canPress}
				<button
					onclick={handlePressAlbum}
					class="w-full px-4 py-3 rounded-lg font-semibold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
				>
					Press New Album
				</button>
				<p class="text-xs text-gray-400 mt-2 text-center">
					Cost scales with catalog size
				</p>
			{:else}
				<button
					disabled
					class="w-full px-4 py-3 rounded-lg font-semibold bg-gray-700 text-gray-500 cursor-not-allowed"
				>
					Album on Cooldown
				</button>
				<p class="text-xs text-gray-400 mt-2 text-center">
					Next album in: {formatDuration(48 * 60 * 60 * 1000 - timeSinceLastAlbum())}
				</p>
			{/if}
		</div>

		<!-- Stats -->
		<div class="stats mt-4 grid grid-cols-2 gap-3 text-sm">
			<div class="stat-item bg-gray-800 p-3 rounded">
				<p class="text-gray-400">Total Albums Released</p>
				<p class="text-xl font-bold">{gameState.totalAlbumsReleased}</p>
			</div>
			<div class="stat-item bg-gray-800 p-3 rounded">
				<p class="text-gray-400">Lifetime Album Revenue</p>
				<p class="text-xl font-bold text-green-400">
					{formatMoney((gameState.activeAlbumBatch?.revenueGenerated || 0))}
				</p>
			</div>
		</div>
	</div>
{/if}
