<script lang="ts">
	/**
	 * UpgradePanel Component
	 *
	 * A flexible panel for displaying various upgrade types.
	 * Can be used for non-tech upgrades like platforms, special abilities, etc.
	 */

	interface Upgrade {
		id: string;
		name: string;
		description: string;
		cost: number;
		purchased?: boolean;
		unlocked?: boolean;
		icon?: string;
	}

	interface Props {
		/** Panel title */
		title: string;
		/** List of upgrades to display */
		upgrades: Upgrade[];
		/** Purchase handler */
		onPurchase?: (upgradeId: string) => void;
		/** Can afford check */
		canAfford?: (cost: number) => boolean;
	}

	let { title, upgrades, onPurchase, canAfford }: Props = $props();

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
	 * Handle purchase button click
	 */
	function handlePurchase(upgradeId: string) {
		if (onPurchase) {
			onPurchase(upgradeId);
		}
	}
</script>

<div class="bg-game-panel p-6 rounded-lg shadow-lg border border-gray-800">
	<h2 class="text-2xl font-bold mb-4 text-game-accent">{title}</h2>

	{#if upgrades.length === 0}
		<p class="text-gray-500 text-center py-4">No upgrades available</p>
	{:else}
		<div class="space-y-3">
			{#each upgrades as upgrade}
				{@const isPurchased = upgrade.purchased ?? false}
				{@const isUnlocked = upgrade.unlocked ?? true}
				{@const affordable = canAfford ? canAfford(upgrade.cost) : true}
				{@const canBuy = !isPurchased && isUnlocked && affordable}

				<div
					class="upgrade-item p-4 rounded border transition-colors {isPurchased
						? 'bg-green-900/20 border-green-700'
						: isUnlocked
							? affordable
								? 'bg-blue-900/20 border-blue-700 hover:bg-blue-900/30'
								: 'bg-gray-900/20 border-gray-700'
							: 'bg-gray-900/10 border-gray-800 opacity-50'}"
				>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								{#if upgrade.icon}
									<span class="text-2xl">{upgrade.icon}</span>
								{/if}
								<h3 class="font-semibold text-lg">
									{upgrade.name}
									{#if isPurchased}
										<span class="text-green-400 text-sm">✓ Owned</span>
									{/if}
								</h3>
							</div>
							<p class="text-sm text-gray-400">{upgrade.description}</p>
						</div>

						<div class="flex flex-col items-end gap-2">
							<div class="text-lg font-bold text-yellow-400">
								{formatNumber(upgrade.cost)}
							</div>

							{#if !isPurchased}
								{#if isUnlocked}
									<button
										onclick={() => handlePurchase(upgrade.id)}
										disabled={!affordable}
										class="px-4 py-2 rounded font-semibold transition-colors {affordable
											? 'bg-blue-600 hover:bg-blue-700 text-white'
											: 'bg-gray-700 text-gray-500 cursor-not-allowed'}"
									>
										{affordable ? 'Purchase' : 'Too Expensive'}
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
	{/if}
</div>
