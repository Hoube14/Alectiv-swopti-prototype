<script setup>
import { storeToRefs } from 'pinia';
import Selectionpage from './views/Selectionpage.vue';
import SummaryPage from './views/SummaryPage.vue';
import { useOrderStore } from './stores/orderStore';

const orderStore = useOrderStore();
const {
  currentStepId,
  currentStep,
  currentStepIndex,
  visitedSteps,
  progressBarTotalSteps,
  progressBarCurrentIndex
} = storeToRefs(orderStore);
</script>

<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <Selectionpage
      v-if="currentStepId !== 'summary' && currentStep"
      :step="currentStep"
      :currentStepIndex="progressBarCurrentIndex"
      :totalSteps="progressBarTotalSteps"
    />

    <SummaryPage
      v-else-if="currentStepId === 'summary'"
      :currentStepIndex="progressBarCurrentIndex"
      :totalSteps="progressBarTotalSteps"
    />
  </div>
</template>

<style scoped></style>