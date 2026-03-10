<script setup>
import { useOrderStore } from '@/stores/orderStore';

const orderStore = useOrderStore();

function clearUrlAndGo(stepId) {
  orderStore.setShowCheckoutSuccess(false);
  orderStore.setShowCheckoutCancel(false);
  orderStore.navigateTo(stepId);
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
        Betalningen avbröts
      </h1>
      <p class="mb-6" style="color: var(--color-text)">
        Du avbröt betalningen eller något gick fel. Din beställning är sparad – du kan gå tillbaka och betala när du vill.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          @click="clearUrlAndGo('summary')"
          class="py-3 px-6 rounded-xl font-semibold transition hover:opacity-95"
          style="background-color: var(--color-primary); color: white;"
        >
          Tillbaka till beställningen
        </button>
        <button
          type="button"
          @click="clearUrlAndGo('glassType')"
          class="py-3 px-6 rounded-xl font-semibold transition hover:opacity-95 border"
          style="border-color: var(--color-border); color: var(--color-text);"
        >
          Börja om
        </button>
      </div>
    </div>
  </div>
</template>
