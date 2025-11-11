<!--
  Resource Bar Component

  Displays player's current resources and income rates.

  Props:
  - gameState: GameState (bindable) - Current game state

  Features:
  - Shows money with income per second
  - Shows total completed songs
  - Shows current fans
  - Shows GPU (if unlocked)
  - Shows industry control progress bar (0-100%)
  - Responsive layout (stacks on mobile)
  - Uses format utilities for readable numbers
-->
<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { formatMoney, formatNumber, formatPercentage } from '$lib/game/utils';
	import { calculateTotalIncome } from '$lib/systems/income';
	import { getFanGrowthRate } from '$lib/systems/fans';

	/**
	 * Game state prop (bindable)
	 * Component updates when state changes
	 */
	let { gameState = $bindable() }: { gameState: GameState } = $props();

	/**
	 * Derived values that update reactively
	 * These recalculate whenever gameState changes
	 */
	const incomePerSecond = $derived(calculateTotalIncome(gameState));
	const fanGrowthRate = $derived(getFanGrowthRate(gameState));
	const industryControlPercentage = $derived(formatPercentage(gameState.industryControl, false));
</script>

<!-- Resource Bar Container -->
<div class="resource-bar bg-game-panel p-4 rounded-lg shadow-lg border border-gray-800">
	<!-- Resources Grid -->
	<div class="resources-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
		<!-- Money -->
		<div class="resource-item">
			<div class="flex items-center gap-2 text-yellow-400">
				<span class="text-2xl">💰</span>
				<div class="flex-1">
					<div class="text-sm text-gray-400">Money</div>
					<div class="text-xl font-bold">{formatMoney(gameState.money)}</div>
					<div class="text-xs text-green-400">+{formatMoney(incomePerSecond)}/s</div>
				</div>
			</div>
		</div>

		<!-- Songs -->
		<div class="resource-item">
			<div class="flex items-center gap-2 text-blue-400">
				<span class="text-2xl">🎵</span>
				<div class="flex-1">
					<div class="text-sm text-gray-400">Songs</div>
					<div class="text-xl font-bold">{formatNumber(gameState.totalCompletedSongs)}</div>
					{#if gameState.songsInQueue > 0}
						<div class="text-xs text-blue-300">+{gameState.songsInQueue} queued</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Fans -->
		<div class="resource-item">
			<div class="flex items-center gap-2 text-pink-400">
				<span class="text-2xl">👥</span>
				<div class="flex-1">
					<div class="text-sm text-gray-400">Fans</div>
					<div class="text-xl font-bold">{formatNumber(gameState.currentArtist.fans)}</div>
					{#if fanGrowthRate > 0}
						<div class="text-xs text-pink-300">+{formatNumber(fanGrowthRate)}/s</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- GPU (only if unlocked) -->
		{#if gameState.unlockedSystems.gpu}
			<div class="resource-item">
				<div class="flex items-center gap-2 text-purple-400">
					<span class="text-2xl">🖥️</span>
					<div class="flex-1">
						<div class="text-sm text-gray-400">GPU</div>
						<div class="text-xl font-bold">{formatNumber(gameState.gpu)}</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Industry Control Progress Bar -->
	<div class="industry-control">
		<div class="flex justify-between items-center mb-2">
			<span class="text-sm text-gray-400">Industry Control</span>
			<span class="text-sm font-bold text-game-accent">{industryControlPercentage}</span>
		</div>
		<div class="progress-bar bg-gray-800 rounded-full h-4 overflow-hidden">
			<div
				class="progress-fill bg-gradient-to-r from-game-accent to-blue-500 h-full transition-all duration-300"
				style="width: {gameState.industryControl}%"
			></div>
		</div>
	</div>
</div>

<style>
	.resource-bar {
		width: 100%;
	}

	.resource-item {
		min-width: 0; /* Prevent overflow */
	}

	.progress-bar {
		position: relative;
	}

	.progress-fill {
		box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.resources-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
