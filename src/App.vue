<script setup>
import { provide,ref } from 'vue';
import GlassTypeSelectionPage from './views/GlassTypeSelectionPage.vue';
import ToneSelectionPage from './views/ToneSelectionPage.vue';

const currentView = ref('glassType');
// Order object that will be shared across components
const order = ref({
  glassType: null,
  toneType: null,
  totalPrice: 0
})

function navigateTo(view) {
  currentView.value = view;
}

function updateOrder(key, value) {
  order.value[key] = value;
}

// Provide the order object and navigation function to children
provide('currentView', currentView);
provide('order', order);
provide('navigateTo', navigateTo);
provide('updateOrder', updateOrder);
</script>

<template>
  <GlassTypeSelectionPage v-if="currentView === 'glassType'" />
  <ToneSelectionPage v-else-if="currentView === 'toneSelection'" />
</template>

<style scoped></style>
