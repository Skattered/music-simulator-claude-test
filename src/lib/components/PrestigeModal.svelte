<!--
  Prestige Modal Component

  Confirmation dialog for creating a new artist (prestige).
  Shows benefits and costs of prestiging.
-->
<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { formatNumber } from '$lib/game/utils';
	import { canPrestige, performPrestige } from '$lib/systems/prestige';
	import { generateArtistName } from '$lib/data/names';

	let { gameState = $bindable(), isOpen = $bindable(), onClose }: {
		gameState: GameState;
		isOpen: boolean;
		onClose: () => void;
	} = $props();

	const canPerformPrestige = $derived(canPrestige(gameState));

	function handlePrestige() {
		const newName = generateArtistName();
		performPrestige(gameState, newName);
		onClose();
	}
</script>

{#if isOpen}
	<div class="modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
		<div class="modal-content bg-game-panel p-6 rounded-lg shadow-2xl border-2 border-purple-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<h2 class="text-3xl font-bold mb-4 text-purple-400 flex items-center gap-2">
				🌟 Create New Artist
			</h2>

			<div class="content space-y-4">
				<!-- Current Artist Stats -->
				<div class="current-stats bg-gray-800 p-4 rounded-lg">
					<h3 class="font-bold text-lg mb-2">Current Artist: {gameState.currentArtist.name}</h3>
					<div class="grid grid-cols-2 gap-2 text-sm">
						<div>
							<p class="text-gray-400">Songs</p>
							<p class="font-bold">{formatNumber(gameState.currentArtist.totalSongs)}</p>
						</div>
						<div>
							<p class="text-gray-400">Fans</p>
							<p class="font-bold">{formatNumber(gameState.currentArtist.fans)}</p>
						</div>
						<div>
							<p class="text-gray-400">Peak Fans</p>
							<p class="font-bold text-yellow-400">{formatNumber(gameState.currentArtist.peakFans)}</p>
						</div>
						<div>
							<p class="text-gray-400">Tech Tier</p>
							<p class="font-bold text-blue-400">{gameState.currentTechTier}</p>
						</div>
					</div>
				</div>

				<!-- Benefits -->
				<div class="benefits bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
					<h3 class="font-bold text-green-400 mb-2">✅ You Keep:</h3>
					<ul class="text-sm space-y-1 text-gray-300">
						<li>• All tech upgrades</li>
						<li>• All unlocked systems</li>
						<li>• Industry control progress</li>
						<li>• Owned platforms</li>
					</ul>
				</div>

				<div class="benefits bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
					<h3 class="font-bold text-purple-400 mb-2">⭐ You Gain:</h3>
					<ul class="text-sm space-y-1 text-gray-300">
						<li>• Fresh start with new artist name</li>
						<li>• Experience multiplier boost</li>
						<li>• Cross-promotion from legacy artist (80% passive income)</li>
						<li>• Faster progression with better tech</li>
					</ul>
				</div>

				<!-- Costs -->
				<div class="costs bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
					<h3 class="font-bold text-red-400 mb-2">⚠️ You Lose:</h3>
					<ul class="text-sm space-y-1 text-gray-300">
						<li>• Current artist becomes "legacy" (passive only)</li>
						<li>• All songs reset to 0</li>
						<li>• All fans reset to 0</li>
						<li>• All money (start fresh)</li>
						<li>• Active tours/albums/boosts</li>
					</ul>
				</div>

				<!-- Legacy Artists Info -->
				{#if gameState.legacyArtists.length > 0}
					<div class="legacy-info bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
						<h3 class="font-bold text-blue-400 mb-2">💫 Current Legacy Artists ({gameState.legacyArtists.length}/3)</h3>
						<div class="space-y-1 text-sm">
							{#each gameState.legacyArtists as legacy}
								<p class="text-gray-300">
									{legacy.name} • {formatNumber(legacy.totalSongs)} songs • {formatNumber(legacy.fans)} fans
								</p>
							{/each}
						</div>
						{#if gameState.legacyArtists.length >= 3}
							<p class="text-xs text-yellow-400 mt-2">
								⚠️ Warning: Oldest legacy artist will retire (max 3 legacy artists)
							</p>
						{/if}
					</div>
				{/if}

				<!-- Warning -->
				{#if !canPerformPrestige}
					<div class="warning bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg">
						<p class="text-yellow-400 text-sm">
							⚠️ Prestige not available yet. Unlock higher tech tiers to prestige!
						</p>
					</div>
				{/if}
			</div>

			<!-- Buttons -->
			<div class="buttons flex gap-3 mt-6">
				<button
					onclick={onClose}
					class="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white"
				>
					Cancel
				</button>
				<button
					onclick={handlePrestige}
					disabled={!canPerformPrestige}
					class="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors {canPerformPrestige ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}"
				>
					Create New Artist
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
