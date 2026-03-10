<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Selectionpage from './views/Selectionpage.vue';
import SummaryPage from './views/SummaryPage.vue';
import CheckoutSuccessPage from './views/CheckoutSuccessPage.vue';
import CheckoutCancelPage from './views/CheckoutCancelPage.vue';
import { useOrderStore } from './stores/orderStore';

const orderStore = useOrderStore();
const {
  currentStepId,
  currentStep,
  progressBarTotalSteps,
  progressBarCurrentIndex
} = storeToRefs(orderStore);

onMounted(() => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const checkout = params.get('checkout');
  orderStore.setShowCheckoutSuccess(checkout === 'success');
  orderStore.setShowCheckoutCancel(checkout === 'cancel');
  if (checkout === 'success') {
    try {
      const saved = sessionStorage.getItem('glasonline_checkout_order');
      if (saved) orderStore.restoreOrderFromCheckout(JSON.parse(saved));
    } catch (_) { /* ignore */ }
  }
});

const { showCheckoutSuccess, showCheckoutCancel } = storeToRefs(orderStore);
</script>

<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <CheckoutSuccessPage v-if="showCheckoutSuccess" />
    <CheckoutCancelPage v-else-if="showCheckoutCancel" />

    <template v-else>
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
    </template>
  </div>
</template>

<style scoped></style>