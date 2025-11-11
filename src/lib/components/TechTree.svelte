<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { ALL_TECH_UPGRADES } from '$lib/data/tech-upgrades';
	import { purchaseTechUpgrade, canAffordUpgrade } from '$lib/systems/tech';
	import { canPurchaseUpgrade } from '$lib/data/tech-upgrades';

	/**
	 * TechTree Component
	 *
	 * Displays all tech upgrades organized by tier.
	 * Shows purchase status and allows purchasing upgrades.
	 */

	interface Props {
		/** Game state (bindable) */
		gameState: GameState;
	}

	let { gameState = $bindable() }: Props = $props();

	/**
	 * Group upgrades by tier
	 */
	const upgradesByTier = $derived(() => {
		const grouped: Record<number, typeof ALL_TECH_UPGRADES> = {};
		for (const upgrade of ALL_TECH_UPGRADES) {
			if (!grouped[upgrade.tier]) {
				grouped[upgrade.tier] = [];
			}
			grouped[upgrade.tier].push(upgrade);
		}
		return grouped;
	});

	/**
	 * Handle upgrade purchase
	 */
	function handlePurchase(upgradeId: string) {
		const success = purchaseTechUpgrade(gameState, upgradeId);
		if (success) {
			console.log(`[UI] Purchased upgrade: ${upgradeId}`);
		}
	}

	/**
	 * Format large numbers for display
	 */
	function formatNumber(num: number): string {
		if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
		if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
		if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
		return `$${num.toFixed(0)}`;
	}

	/**
	 * Get tier name
	 */
	function getTierName(tier: number): string {
		const names = [
			'',
			'Third-party Web Services',
			'Lifetime Licenses',
			'Local AI Models',
			'Fine-tuned Models',
			'Train Your Own Models',
			'Build Your Own Software',
			'AI Agent Automation'
		];
		return names[tier] || `Tier ${tier}`;
	}
</script>

<div class="bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800">
	<h2 class="text-2xl font-bold mb-4 text-game-accent">🔬 Tech Tree</h2>

	<div class="space-y-6">
		{#each Object.entries(upgradesByTier()) as [tierStr, upgrades]}
			{@const tier = parseInt(tierStr)}
			<div class="tier-section">
				<h3 class="text-xl font-semibold mb-3 text-blue-400">
					Tier {tier}: {getTierName(tier)}
				</h3>

				<div class="space-y-2">
					{#each upgrades as upgrade}
						{@const purchased = gameState.purchasedUpgrades.includes(upgrade.id)}
						{@const canAfford = canAffordUpgrade(gameState, upgrade.id)}
						{@const canPurchase = canPurchaseUpgrade(upgrade, gameState.purchasedUpgrades)}
						{@const unlocked = canPurchase && !purchased}

						<div
							class="upgrade-item p-4 rounded border transition-colors {purchased
								? 'bg-green-900/20 border-green-700'
								: unlocked
									? canAfford
										? 'bg-blue-900/20 border-blue-700 hover:bg-blue-900/30'
										: 'bg-gray-900/20 border-gray-700'
									: 'bg-gray-900/10 border-gray-800 opacity-50'}"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h4 class="font-semibold text-lg">
											{upgrade.name}
											{#if purchased}
												<span class="text-green-400 text-sm">✓ Purchased</span>
											{/if}
										</h4>
									</div>
									<p class="text-sm text-gray-400 mb-2">{upgrade.description}</p>

									<!-- Effects -->
									<div class="flex flex-wrap gap-3 text-xs">
										{#if upgrade.effects.generationSpeedMultiplier && upgrade.effects.generationSpeedMultiplier !== 1.0}
											<span class="text-purple-400">
												Speed: {upgrade.effects.generationSpeedMultiplier.toFixed(1)}x
											</span>
										{/if}
										{#if upgrade.effects.incomeMultiplier && upgrade.effects.incomeMultiplier !== 1.0}
											<span class="text-green-400">
												Income: {upgrade.effects.incomeMultiplier.toFixed(1)}x
											</span>
										{/if}
										{#if upgrade.effects.fanMultiplier && upgrade.effects.fanMultiplier !== 1.0}
											<span class="text-blue-400">
												Fans: {upgrade.effects.fanMultiplier.toFixed(1)}x
											</span>
										{/if}
										{#if upgrade.effects.unlockPrestige}
											<span class="text-yellow-400 font-bold">🌟 Unlocks Prestige!</span>
										{/if}
										{#if upgrade.effects.unlockGPU}
											<span class="text-yellow-400 font-bold">⚡ Unlocks GPU!</span>
										{/if}
									</div>
								</div>

								<div class="flex flex-col items-end gap-2">
									<div class="text-lg font-bold text-yellow-400">
										{formatNumber(upgrade.cost)}
									</div>

									{#if !purchased}
										{#if unlocked}
											<button
												onclick={() => handlePurchase(upgrade.id)}
												disabled={!canAfford}
												class="px-4 py-2 rounded font-semibold transition-colors {canAfford
													? 'bg-blue-600 hover:bg-blue-700 text-white'
													: 'bg-gray-700 text-gray-500 cursor-not-allowed'}"
											>
												{canAfford ? 'Purchase' : 'Too Expensive'}
											</button>
										{:else}
											<span class="text-sm text-gray-500">Locked</span>
										{/if}
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
