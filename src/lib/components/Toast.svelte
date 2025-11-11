<!--
  Toast Notification Component

  Displays temporary notification messages.
  Auto-dismisses after a timeout.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	export interface ToastMessage {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
		duration?: number;
	}

	let { toast, onDismiss }: {
		toast: ToastMessage;
		onDismiss: (id: string) => void;
	} = $props();

	const duration = toast.duration || 3000;

	onMount(() => {
		const timer = setTimeout(() => {
			onDismiss(toast.id);
		}, duration);

		return () => clearTimeout(timer);
	});

	function getTypeClasses(type: string): string {
		switch (type) {
			case 'success': return 'bg-green-600 border-green-500';
			case 'error': return 'bg-red-600 border-red-500';
			case 'warning': return 'bg-yellow-600 border-yellow-500';
			case 'info': return 'bg-blue-600 border-blue-500';
			default: return 'bg-gray-700 border-gray-600';
		}
	}

	function getIcon(type: string): string {
		switch (type) {
			case 'success': return '✅';
			case 'error': return '❌';
			case 'warning': return '⚠️';
			case 'info': return 'ℹ️';
			default: return '📢';
		}
	}
</script>

<div class="toast-item {getTypeClasses(toast.type)} px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slideIn">
	<span class="text-xl">{getIcon(toast.type)}</span>
	<p class="text-white font-medium flex-1">{toast.message}</p>
	<button
		onclick={() => onDismiss(toast.id)}
		class="text-white hover:text-gray-300 transition-colors font-bold text-xl leading-none"
		aria-label="Dismiss"
	>
		×
	</button>
</div>

<style>
	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slideIn {
		animation: slideIn 0.3s ease-out;
	}
</style>
