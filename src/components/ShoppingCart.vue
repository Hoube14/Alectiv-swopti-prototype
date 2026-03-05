<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore } from '@/stores/orderStore';

const props = defineProps({
  totalPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'kr'
  },
  title: {
    type: String,
    default: 'Dina glas'
  }
})

const orderStore = useOrderStore();
const { order, priceModifiers } = storeToRefs(orderStore);
const { steps } = storeToRefs(orderStore);

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// Short labels for cart display (step id -> label)
const stepLabels = {
  glassType: 'Glastyp',
  lensBrand: 'Glasmärke',
  lensRecommendation: 'Glasindex',
  treatment: 'Behandling',
  tintSelection: 'Toning',
  sunglassType: 'Solglas',
  solidTintSelection: 'Toning',
  gradientTintSelection: 'Gradienttoning',
  photochromicColorSelection: 'Färgskiftande',
  colorSelection: 'Färg',
  glass: 'Glas',
  frame: 'Båge',
  usage: 'Användning',
  prescription: 'Recept'
};

const cartItems = computed(() => {
  const items = [];
  const stepsList = steps.value || [];
  for (const step of stepsList) {
    if (step.id === 'summary') continue;
    const selection = order.value?.selections?.[step.id];
    if (!selection?.title) continue;
    const label = stepLabels[step.id] || step.title;
    const price = selection.priceKey ? (priceModifiers.value?.[selection.priceKey] ?? 0) : null;
    items.push({ stepId: step.id, label, title: selection.title, price });
  }
  return items;
});

const displayTotal = computed(() => {
  const total = order.value?.totalPrice ?? props.totalPrice;
  return typeof total === 'number' ? total.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : total;
});
</script>

<template>
  <div v-if="!isExpanded"
       @click="toggleExpand"
       class="fixed bottom-0 left-0 right-0 bg-custom-wheat py-2 border-t border-gray-200 cursor-pointer">
    <div class="flex justify-center items-center">
      <div class="flex items-center gap-4">
        <span class="text-gray-700">{{ title }}</span>
        <div class="flex items-center">
          <span>{{ displayTotal }} {{ currency }}</span>
          <svg
            class="ml-2 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Expanded view when expanded - modal panel -->
  <div v-if="isExpanded" class="fixed inset-0 flex justify-center items-end bg-black/20" @click.self="toggleExpand">
    <div class="bg-white border border-gray-200 rounded-t-lg shadow-lg w-full max-w-md max-h-[85vh] flex flex-col">
      <!-- Header with close button -->
      <div class="flex justify-between items-center p-4 flex-shrink-0">
        <h2 class="text-lg font-semibold text-gray-900">Nya glas i egen båge</h2>
        <button @click="toggleExpand" class="text-gray-500 hover:text-gray-700 p-1" aria-label="Stäng">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="border-t border-gray-200 flex-shrink-0"></div>

      <!-- Itemized selections -->
      <div class="p-4 overflow-y-auto flex-1 min-h-0">
        <template v-if="cartItems.length > 0">
          <div
            v-for="item in cartItems"
            :key="item.stepId"
            class="py-3 border-b border-gray-100 last:border-b-0"
          >
            <p class="font-semibold text-gray-800 text-sm">{{ item.label }}</p>
            <div class="flex justify-between items-baseline gap-2 mt-0.5">
              <p class="text-gray-600 text-sm">{{ item.title }}</p>
              <span v-if="item.price != null" class="text-gray-600 text-sm whitespace-nowrap">
                {{ typeof item.price === 'number' ? item.price.toLocaleString('sv-SE', { minimumFractionDigits: 2 }) : item.price }} {{ currency }}
              </span>
            </div>
          </div>
        </template>
        <p v-else class="text-gray-500 text-sm py-2">Inga val gjorda ännu.</p>
      </div>

      <div class="border-t border-gray-200 flex-shrink-0"></div>

      <!-- Total -->
      <div class="p-4 flex-shrink-0">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-900">Totalt</span>
          <span class="font-semibold text-gray-900">{{ displayTotal }} {{ currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
