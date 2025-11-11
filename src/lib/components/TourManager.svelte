<!--
  Tour Manager Component

  Displays tour management UI.
  Allows player to start tours with different tier multipliers.
-->
<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { formatMoney, formatDuration, formatPercentage } from '$lib/game/utils';
	import { startTour, canStartTour, getTourCooldownRemaining, TOUR_TIERS } from '$lib/systems/tours';

	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Derived values
	const hasActiveTour = $derived(gameState.activeTour !== null);
	const canStart = $derived(canStartTour(gameState));
	const cooldownRemaining = $derived(getTourCooldownRemaining(gameState));

	// Calculate tour progress
	const tourProgress = $derived(() => {
		if (!gameState.activeTour) return 0;
		const now = Date.now();
		const elapsed = now - gameState.activeTour.startTime;
		const duration = gameState.activeTour.endTime - gameState.activeTour.startTime;
		return Math.min(1, elapsed / duration);
	});

	function handleStartTour(tierIndex: number) {
		startTour(gameState, tierIndex);
	}
</script>

{#if gameState.unlockedSystems.tours}
	<div class="tour-manager bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800">
		<h2 class="text-2xl font-bold mb-4 text-game-accent flex items-center gap-2">
			🎸 Tours & Concerts
		</h2>

		{#if hasActiveTour && gameState.activeTour}
			<!-- Active Tour Display -->
			<div class="active-tour bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-lg mb-4 border border-purple-500/30">
				<div class="flex justify-between items-start mb-3">
					<div>
						<h3 class="text-xl font-bold text-purple-300">{gameState.activeTour.name}</h3>
						<p class="text-sm text-gray-400">Revenue Multiplier: <span class="text-green-400 font-bold">{gameState.activeTour.revenueMultiplier}x</span></p>
					</div>
					<div class="text-right">
						<p class="text-sm text-gray-400">Time Remaining</p>
						<p class="text-lg font-bold text-purple-300">
							{formatDuration((gameState.activeTour.endTime - Date.now()))}
						</p>
					</div>
				</div>

				<!-- Tour Progress Bar -->
				<div class="mb-2">
					<div class="flex justify-between text-xs text-gray-400 mb-1">
						<span>Tour Progress</span>
						<span>{Math.floor(tourProgress() * 100)}%</span>
					</div>
					<div class="bg-gray-800 rounded-full h-3 overflow-hidden">
						<div
							class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
							style="width: {tourProgress() * 100}%"
						></div>
					</div>
				</div>

				<p class="text-xs text-purple-300 mt-2">
					🎤 All income sources multiplied by {gameState.activeTour.revenueMultiplier}x during tour!
				</p>
			</div>
		{:else}
			<!-- Tour Selection -->
			<div class="tour-selection space-y-2 mb-4">
				{#each TOUR_TIERS as tier, index}
					<button
						onclick={() => handleStartTour(index)}
						disabled={!canStart}
						class="w-full text-left p-3 rounded-lg transition-colors border {canStart ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-purple-500' : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'}"
					>
						<div class="flex justify-between items-center">
							<div>
								<p class="font-bold text-purple-300">{tier.name}</p>
								<p class="text-xs text-gray-400">
									{formatDuration(tier.durationDays * 24 * 60 * 60 * 1000)} • <span class="text-green-400">{tier.multiplier}x Revenue</span>
								</p>
							</div>
							<div class="text-right">
								<p class="font-bold text-yellow-400">{formatMoney(tier.baseCost)}</p>
								<p class="text-xs text-gray-400">Cost</p>
							</div>
						</div>
					</button>
				{/each}
			</div>

			{#if !canStart}
				<div class="cooldown-notice bg-gray-800 p-3 rounded-lg text-center">
					<p class="text-sm text-gray-400">Next tour available in:</p>
					<p class="text-lg font-bold text-purple-300">{formatDuration(cooldownRemaining * 1000)}</p>
				</div>
			{/if}
		{/if}

		<!-- Stats -->
		<div class="stats mt-4 grid grid-cols-2 gap-3 text-sm">
			<div class="stat-item bg-gray-800 p-3 rounded">
				<p class="text-gray-400">Total Tours Completed</p>
				<p class="text-xl font-bold">{gameState.totalToursCompleted}</p>
			</div>
			<div class="stat-item bg-gray-800 p-3 rounded">
				<p class="text-gray-400">Current Multiplier</p>
				<p class="text-xl font-bold text-green-400">
					{gameState.activeTour ? `${gameState.activeTour.revenueMultiplier}x` : '1.0x'}
				</p>
			</div>
		</div>
	</div>
{/if}
