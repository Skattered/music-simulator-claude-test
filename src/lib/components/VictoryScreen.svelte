<!--
  Victory Screen Component

  Displayed when player reaches 100% industry control.
  Shows final stats and celebration.
-->
<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { formatNumber, formatMoney, formatDuration } from '$lib/game/utils';

	let { gameState, onNewGame, onContinue }: {
		gameState: GameState;
		onNewGame: () => void;
		onContinue: () => void;
	} = $props();

	const totalIncome = $derived(() => {
		// Calculate approximate total income
		return gameState.money;
	});
</script>

<div class="victory-screen fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
	<div class="victory-content bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-xl shadow-2xl border-4 border-yellow-400 max-w-3xl w-full animate-fadeIn">
		<!-- Title -->
		<div class="text-center mb-8">
			<h1 class="text-5xl md:text-6xl font-bold text-yellow-400 mb-2 animate-bounce">
				🎉 VICTORY! 🎉
			</h1>
			<h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
				You Control the Music Industry!
			</h2>
			<p class="text-lg text-gray-300 max-w-2xl mx-auto">
				Congratulations! You've reached 100% industry control and achieved total domination of the music industry. From a single AI-generated song to owning the entire ecosystem, your empire is complete.
			</p>
		</div>

		<!-- Stats Grid -->
		<div class="stats-grid grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
			<div class="stat-card bg-black/30 p-4 rounded-lg border border-yellow-400/50">
				<p class="text-sm text-gray-400 mb-1">Total Songs</p>
				<p class="text-2xl font-bold text-yellow-400">{formatNumber(gameState.totalCompletedSongs)}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-purple-400/50">
				<p class="text-sm text-gray-400 mb-1">Total Fans</p>
				<p class="text-2xl font-bold text-purple-400">{formatNumber(gameState.currentArtist.fans)}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-green-400/50">
				<p class="text-sm text-gray-400 mb-1">Money</p>
				<p class="text-2xl font-bold text-green-400">{formatMoney(gameState.money)}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-blue-400/50">
				<p class="text-sm text-gray-400 mb-1">Prestige Count</p>
				<p class="text-2xl font-bold text-blue-400">{gameState.totalPrestiges}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-pink-400/50">
				<p class="text-sm text-gray-400 mb-1">Albums Released</p>
				<p class="text-2xl font-bold text-pink-400">{gameState.totalAlbumsReleased}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-orange-400/50">
				<p class="text-sm text-gray-400 mb-1">Tours Completed</p>
				<p class="text-2xl font-bold text-orange-400">{gameState.totalToursCompleted}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-cyan-400/50">
				<p class="text-sm text-gray-400 mb-1">Time Played</p>
				<p class="text-2xl font-bold text-cyan-400">{formatDuration(gameState.totalTimePlayed * 1000)}</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-red-400/50">
				<p class="text-sm text-gray-400 mb-1">Tech Tier</p>
				<p class="text-2xl font-bold text-red-400">{gameState.currentTechTier} / 7</p>
			</div>

			<div class="stat-card bg-black/30 p-4 rounded-lg border border-indigo-400/50">
				<p class="text-sm text-gray-400 mb-1">Owned Platforms</p>
				<p class="text-2xl font-bold text-indigo-400">{gameState.ownedPlatforms.length}</p>
			</div>
		</div>

		<!-- Reflection Text -->
		<div class="reflection bg-black/40 p-6 rounded-lg border border-gray-700 mb-8">
			<h3 class="text-xl font-bold text-yellow-400 mb-3">A Reflection on Your Empire</h3>
			<p class="text-gray-300 leading-relaxed">
				You started with nothing but an idea and an AI. Through relentless optimization, algorithmic manipulation, and strategic exploitation, you've built an empire that spans the entire music industry. You own the platforms, control the algorithms, and dictate what billions hear. This is the ultimate expression of quantity over quality, capitalism over art. Congratulations... or condolences?
			</p>
		</div>

		<!-- Buttons -->
		<div class="buttons flex flex-col sm:flex-row gap-4">
			<button
				onclick={onContinue}
				class="flex-1 px-6 py-4 rounded-lg font-bold text-lg transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
			>
				Continue Playing
			</button>
			<button
				onclick={onNewGame}
				class="flex-1 px-6 py-4 rounded-lg font-bold text-lg transition-all bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl"
			>
				Start New Game
			</button>
		</div>

		<p class="text-center text-gray-400 text-sm mt-4">
			Thank you for playing! 🎵
		</p>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.animate-fadeIn {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.animate-bounce {
		animation: bounce 1s ease-in-out infinite;
	}
</style>
