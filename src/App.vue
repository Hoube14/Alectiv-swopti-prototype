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
  <div>
    <div class="bg-blue-100 p-4 mb-4">
      <label class="mr-2">Välj butik:</label>
      <select v-model="currentStore" @change="orderStore.calculateTotalPrice" class="border p-2 rounded">
        <option v-for="(store, id) in stores" :key="id" :value="id">
          {{ store.name }} ({{ store.currency }})
        </option>
      </select>
    </div>
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
</template>

<style scoped></style>