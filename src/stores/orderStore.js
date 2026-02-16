import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import productData from '../../products.json';
import productSteps from '../config/productSteps';

export const useOrderStore = defineStore('order', () => {
  const currentStore = ref('store_1');
  const steps = ref(productSteps);
  const navigationHistory = ref([]);
  const currentStepId = ref('glassType');

  const order = ref({
    selections: {},
    totalPrice: 0
  });

  const stores = computed(() => productData.stores);
  const activeStore = computed(() => stores.value[currentStore.value]);
  const priceModifiers = computed(() => activeStore.value?.priceModifiers || {});

  const currentStep = computed(() =>
    steps.value.find((step) => step.id === currentStepId.value)
  );

  const visitedSteps = computed(() => {
    const allSteps = [...navigationHistory.value, currentStepId.value];
    return [...new Set(allSteps)].length;
  });

  const currentStepIndex = computed(() => visitedSteps.value);

  function navigateTo(stepId, isBackNavigation = false) {
    if (isBackNavigation) {
      if (navigationHistory.value.length > 0) {
        navigationHistory.value.pop();
      }
    } else {
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
    Object.values(order.value.selections).forEach((selection) => {
      if (selection && selection.priceKey) {
        total += priceModifiers.value[selection.priceKey] || 0;
      }
    });
    if (currentStepId.value === 'summary') {
      total += total * (productData.defaults.taxPercent / 100);
      total += productData.defaults.shipping;
    }
    order.value.totalPrice = total;
  }

  function switchStore(storeId) {
    currentStore.value = storeId;
    calculateTotalPrice();
  }

  return {
    order,
    steps,
    currentStore,
    stores,
    priceModifiers,
    storeData: productData,
    navigationHistory,
    currentStepId,
    currentStep,
    visitedSteps,
    currentStepIndex,
    navigateTo,
    updateOrder,
    calculateTotalPrice,
    switchStore
  };
});
