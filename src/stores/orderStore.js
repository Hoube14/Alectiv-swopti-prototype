import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import productData from '../../products.json';
import productSteps from '../config/productSteps';

export const useOrderStore = defineStore('order', () => {
  const steps = ref(productSteps);
  const navigationHistory = ref([]);
  const currentStepId = ref('glassType');

  const order = ref({
    selections: {},
    totalPrice: 0
  });

  const priceModifiers = computed(() => productData.store?.priceModifiers || {});

  const currentStep = computed(() =>
    steps.value.find((step) => step.id === currentStepId.value)
  );

  const visitedSteps = computed(() => {
    const allSteps = [...navigationHistory.value, currentStepId.value];
    return [...new Set(allSteps)].length;
  });

  const currentStepIndex = computed(() => visitedSteps.value);

  // Max steps from a step to summary (following nextStep); used so progress bar total reflects actual path length
  function maxStepsToSummary(stepId) {
    if (stepId === 'summary') return 0;
    const step = steps.value.find((s) => s.id === stepId);
    if (!step?.options?.length) return 1;
    let max = 0;
    for (const opt of step.options) {
      let next = opt.nextStep;
      if (!next && stepId === 'prescription') next = 'lensBrand';
      if (!next) next = 'summary';
      max = Math.max(max, 1 + maxStepsToSummary(next));
    }
    return max;
  }

  // Dynamic progress: total = completed + remaining (so bar doesn't jump when path is shorter than max)
  const progressBarTotalSteps = computed(() => {
    const remaining = maxStepsToSummary(currentStepId.value);
    return visitedSteps.value + remaining;
  });
  const progressBarCurrentIndex = computed(() => visitedSteps.value);

  function navigateTo(stepId, isBackNavigation = false) {
    if (isBackNavigation) {
      if (navigationHistory.value.length > 0) {
        const stepWeAreGoingBackTo = stepId;
        let newSelections = order.value.selections || {};
        if (stepWeAreGoingBackTo in newSelections) {
          newSelections = Object.fromEntries(
            Object.entries(newSelections).filter(([key]) => key !== stepWeAreGoingBackTo)
          );
          order.value = { ...order.value, selections: newSelections };
        }
        navigationHistory.value.pop();
        currentStepId.value = stepId;
        calculateTotalPrice();
        return;
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

  const showCheckoutSuccess = ref(false);
  function setShowCheckoutSuccess(value) {
    showCheckoutSuccess.value = !!value;
  }

  const showCheckoutCancel = ref(false);
  function setShowCheckoutCancel(value) {
    showCheckoutCancel.value = !!value;
  }

  function restoreOrderFromCheckout(payload) {
    if (!payload || typeof payload !== 'object') return;
    order.value = {
      ...order.value,
      selections: payload.selections && typeof payload.selections === 'object' ? payload.selections : {},
      totalPrice: typeof payload.totalPrice === 'number' ? payload.totalPrice : 0,
      shipping: typeof payload.shipping === 'number' ? payload.shipping : 0
    };
  }

  return {
    order,
    steps,
    priceModifiers,
    storeData: productData,
    navigationHistory,
    currentStepId,
    currentStep,
    visitedSteps,
    currentStepIndex,
    progressBarTotalSteps,
    progressBarCurrentIndex,
    navigateTo,
    updateOrder,
    calculateTotalPrice,
    showCheckoutSuccess,
    setShowCheckoutSuccess,
    showCheckoutCancel,
    setShowCheckoutCancel,
    restoreOrderFromCheckout
  };
});
