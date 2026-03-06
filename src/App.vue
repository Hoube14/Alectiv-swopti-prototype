<script setup>
import { storeToRefs } from 'pinia';
import Selectionpage from './views/Selectionpage.vue';
import SummaryPage from './views/SummaryPage.vue';
import { useOrderStore } from './stores/orderStore';

const orderStore = useOrderStore();
const {
  currentStore,
  stores,
  currentStepId,
  currentStep,
  currentStepIndex,
  visitedSteps
} = storeToRefs(orderStore);
</script>

<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <div class="px-4 py-3 flex items-center gap-3 border-b bg-white/80 backdrop-blur-sm" style="border-color: var(--color-border)">
      <label class="text-sm font-medium" style="color: var(--color-text)">Välj butik:</label>
      <select
        v-model="currentStore"
        @change="orderStore.calculateTotalPrice"
        class="rounded-lg bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
        style="border: 1px solid var(--color-border); color: var(--color-heading)"
      >
        <option v-for="(store, id) in stores" :key="id" :value="id">
          {{ store.name }} ({{ store.currency }})
        </option>
      </select>
    </div>

    <Selectionpage
      v-if="currentStepId !== 'summary'"
      :step="currentStep"
      :currentStepIndex="currentStepIndex"
      :totalSteps="visitedSteps"
    />

    <SummaryPage
      v-else
      :currentStepIndex="currentStepIndex"
      :totalSteps="visitedSteps"
    />
  </div>
</template>

<style scoped></style>