<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore } from '@/stores/orderStore';

const orderStore = useOrderStore();
const { order, priceModifiers, storeData } = storeToRefs(orderStore);

const totalPrice = computed(() => order.value?.totalPrice ?? 0);
const selections = computed(() => order.value?.selections ?? {});
const shipping = computed(() => order.value?.shipping ?? storeData?.defaults?.shipping ?? 0);
const currency = 'SEK';

function startOver() {
  orderStore.setShowCheckoutSuccess(false);
  orderStore.resetOrder();
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('glasonline_checkout_order');
    if (window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      url.searchParams.delete('draft_id');
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }
  }
}
</script>

<template>
  <div class="min-h-screen p-6 md:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="rounded-2xl border shadow-md p-6 md:p-8 mb-6" style="background-color: var(--color-card); border-color: var(--color-border)">
        <h1 class="text-2xl md:text-3xl font-semibold mb-2 text-center" style="color: var(--color-heading)">
          Tack för din beställning
        </h1>
        <p class="text-center mb-6" style="color: var(--color-text)">
          Din betalning är genomförd. Du får en orderbekräftelse via e-post.
        </p>

        <h2 class="text-xl font-semibold mb-4" style="color: var(--color-heading)">Din beställning</h2>
        <div class="mb-6">
          <div class="flex justify-between py-2 border-b" style="border-color: var(--color-border)">
            <span class="font-medium" style="color: var(--color-text)">Produkt</span>
            <span class="font-medium" style="color: var(--color-text)">Pris</span>
          </div>
          <div class="py-4 border-b" style="border-color: var(--color-border)">
            <div class="mb-2">
              <span class="font-medium" style="color: var(--color-heading)">Dina val:</span>
            </div>
            <div class="mt-4 space-y-4">
              <div v-if="selections.glassType">
                <div class="font-medium" style="color: var(--color-heading)">{{ selections.glassType.title }} - {{ selections.tintSelection?.title || 'ofärgade' }}</div>
                <div style="color: var(--color-text)">{{ (totalPrice - shipping).toFixed(2) }} {{ currency }}</div>
              </div>
              <div class="space-y-2 text-sm" style="color: var(--color-text)">
                <div v-if="selections.photochromicColorSelection">Färgskiftande glas: {{ selections.photochromicColorSelection.title }}</div>
                <div v-if="selections.colorSelection">Färg: {{ selections.colorSelection.title }}</div>
                <div v-if="selections.usage">Hur ska du använda dina glasögon?: {{ selections.usage.title }}</div>
                <div v-if="selections.glassType">Typ av glas: {{ selections.glassType.title }}</div>
                <div v-if="selections.prescription">Recept: {{ selections.prescription.title }}</div>
                <div v-if="selections.lensBrand">Glasmärke: {{ selections.lensBrand.title }}</div>
                <div v-if="selections.lensRecommendation">Glas: {{ selections.lensRecommendation.title }}</div>
                <div v-if="selections.treatment">Behandling: {{ selections.treatment.title }}</div>
              </div>
            </div>
          </div>
          <div class="flex justify-between py-2" style="color: var(--color-text)">
            <span>Frakt</span>
            <span>{{ shipping }} {{ currency }}</span>
          </div>
          <div class="flex justify-between py-2 mt-4 border-t-2 font-semibold" style="border-color: var(--color-border); color: var(--color-heading)">
            <span>Totalt betalt</span>
            <span>{{ totalPrice.toFixed(2) }} {{ currency }}</span>
          </div>
        </div>

        <div class="text-center">
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
    </div>
  </div>
</template>
