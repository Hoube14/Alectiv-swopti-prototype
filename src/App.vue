<script setup>
import { provide, ref, computed } from 'vue';
import Selectionpage from './views/Selectionpage.vue';
import productData from '../products.json';
import SummaryPage from './views/SummaryPage.vue';
import productSteps from './config/productSteps';

const currentStore = ref('store_1')
const stores = computed(() => productData.stores)
const activeStore = computed(() => stores.value[currentStore.value])
const priceModifiers = computed(() => activeStore.value?.priceModifiers || {})

const steps = ref(productSteps)
const navigationHistory = ref([]);

const currentStepId = ref('glassType')

const order = ref({
  selections: {},
  totalPrice: 0
})

// Get the current step object
const currentStep = computed(() => 
  steps.value.find(step => step.id === currentStepId.value)
);

// Track unique steps visited (including current)
const visitedSteps = computed(() => {
  const allSteps = [...navigationHistory.value, currentStepId.value];
  return [...new Set(allSteps)].length;
});

// The total is the number of unique steps visited so far
// The bar will grow as the user progresses
const currentStepIndex = computed(() => visitedSteps.value)

function navigateTo(stepId, isBackNavigation = false) {
  if (isBackNavigation) {
    // When going back, simply pop the last step from history
    if (navigationHistory.value.length > 0) {
      navigationHistory.value.pop();
    }
  } else {
    // When going forward, add current step to history (but not summary)
    if (currentStepId.value && currentStepId.value !== 'summary') {
      navigationHistory.value.push(currentStepId.value);
    }
  }
  
  currentStepId.value = stepId;

  if (stepId === 'summary') {
    calculateTotalPrice();
  }
}

function updateOrder(stepId, selection) {
  if (!order.value.selections) {
    order.value.selections = {};
  }
  
  order.value.selections[stepId] = selection;
  
  calculateTotalPrice();
}

function calculateTotalPrice() {
  let total = 0;
  
  Object.values(order.value.selections).forEach(selection => {
    if (selection && selection.priceKey) {
      total += priceModifiers.value[selection.priceKey] || 0;
    }
  });
  
  if (currentStepId.value === 'summary') {
    total += total * (productData.defaults.taxPercent / 100);
    total += productData.defaults.shipping;
  }
  
  // Uppdate order.totalPrice
  order.value.totalPrice = total;
}

function switchStore(storeId) {
  currentStore.value = storeId;
  calculateTotalPrice();
}

// Provide the order object and navigation function to children
provide('order', order);
provide('navigateTo', navigateTo);
provide('updateOrder', updateOrder);
provide('stores', stores);
provide('currentStore', currentStore);
provide('switchStore', switchStore);
provide('priceModifiers', priceModifiers);
provide('storeData', productData);
provide('navigationHistory', navigationHistory);

</script>

<template>
  <div>
    <div class="bg-blue-100 p-4 mb-4">
      <label class="mr-2">Välj butik:</label>
      <select v-model="currentStore" @change="calculateTotalPrice" class="border p-2 rounded">
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