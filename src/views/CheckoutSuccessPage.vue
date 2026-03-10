<script setup>
import { useOrderStore } from '@/stores/orderStore';

const orderStore = useOrderStore();

function startOver() {
  orderStore.setShowCheckoutSuccess(false);
  orderStore.navigateTo('glassType');
  if (typeof window !== 'undefined' && window.history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.delete('checkout');
    window.history.replaceState({}, '', url.pathname + (url.search || ''));
  }
}
</script>

<template>
  <div class="min-h-screen p-6 md:p-8 flex items-center justify-center">
    <div class="max-w-lg w-full rounded-2xl border shadow-md p-8 text-center" style="background-color: var(--color-card); border-color: var(--color-border)">
      <h1 class="text-2xl md:text-3xl font-semibold mb-4" style="color: var(--color-heading)">
        Tack för din beställning
      </h1>
      <p class="mb-6" style="color: var(--color-text)">
        Din betalning är genomförd. Du får en orderbekräftelse via e-post.
      </p>
      <button
        type="button"
        @click="startOver"
        class="py-3 px-6 rounded-xl font-semibold transition hover:opacity-95"
        style="background-color: var(--color-primary); color: white;"
      >
        Konfigurera nya glas
      </button>
    </div>
  </div>
</template>
