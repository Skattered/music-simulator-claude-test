<!--
  Toast Container Component

  Container that holds and manages toast notifications.
-->
<script lang="ts">
	import Toast, { type ToastMessage } from './Toast.svelte';

	let { toasts = $bindable([]) }: { toasts: ToastMessage[] } = $props();

	function handleDismiss(id: string) {
		toasts = toasts.filter(t => t.id !== id);
	}
</script>

<div class="toast-container fixed top-4 right-4 z-50 space-y-2">
	{#each toasts as toast (toast.id)}
		<Toast {toast} onDismiss={handleDismiss} />
	{/each}
</div>
