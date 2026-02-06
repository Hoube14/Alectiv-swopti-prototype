<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import Card from '@/components/Card.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';
import { useOrderStore } from '@/stores/orderStore';

// Props to make page dynamic
const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  currentStepIndex: Number,
  totalSteps: Number
})

const orderStore = useOrderStore();
const {
  order,
  priceModifiers,
  currentStore,
  stores,
  navigationHistory
} = storeToRefs(orderStore);
const { updateOrder, navigateTo } = orderStore;

// Get the image source from the environment variable for widget images
function getImageSrc(src) {
  if (!src) return '';
  return import.meta.env.BASE_URL + src.replace(/^\//, '');
}

// Get the initial glass type selection
const initialGlassType = computed(() => order.value.selections?.glassType?.title || null);

// Function to get the proper title based on glass type
function getProperTitle(option) {
  // Don't modify titles on the first step
  if (props.step.id === 'glassType') {
    return option.title;
  }
  
  // For subsequent steps, modify titles based on glass type (progressive)
  if (initialGlassType.value === "Progressiva glas" && option.title.includes("Enkelslipade")) {
    return option.title.replace("Enkelslipade", "Progressiva");
  }
  
  // For Terminalglas
  if (initialGlassType.value === "Terminalglas" && option.title.includes("Enkelslipade")) {
    return option.title.replace("Enkelslipade", "Terminal");
  }
  
  return option.title;
}

// Get the current store's currency
const currency = computed(() => {
  return stores.value[currentStore.value]?.currency || 'SEK';
});

// Calculate the price for an option based on its priceKey
function getOptionPrice(option) {
  if (!option.priceKey) return undefined;
  return priceModifiers.value?.[option.priceKey] || 0;
}

function handleSelection(option, index) {
  updateOrder(props.step.id, option);

  // Check if this is terminal glasses from the first step
  const isTerminalPath = initialGlassType.value === "Terminalglas";
  
  // Special handling for terminal path
  if (isTerminalPath && props.step.id === 'frame') {
    // Skip usage for terminal glasses, go directly to prescription
    navigateTo('prescription');
  } else if (option.nextStep) {
    navigateTo(option.nextStep);
  }
}

function goBack() {
  // Get the last step from history
  if (navigationHistory.value && navigationHistory.value.length > 0) {
    const previousStepId = navigationHistory.value[navigationHistory.value.length - 1];
    navigateTo(previousStepId, true);
  } else {
    // If no history, go to first step
    navigateTo('glassType', true);
  }
}
</script>

<template>
  <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :current-step="currentStepIndex" :total-steps="totalSteps" />

      <div class="flex items-center mb-8">
        <!-- Add null check for step -->
        <button v-if="step && step.showBackButton" @click="goBack" class="mr-4 text-gray-600">
          <span><- Tillbaka</span>
        </button>
        <h1 class="text-center text-2xl font-medium">{{ step ? step.title : '' }}</h1>
      </div>

      <!-- Cards container -->
      <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <Card
          v-for="(option, index) in (step ? step.options : [])"
          :key="index"
          :title="getProperTitle(option)"
          :description="option.description"
          :imageSrc="getImageSrc(option.imageSrc)"
          :price="getOptionPrice(option)"
          :currency="currency" 
          @click="handleSelection(option, index)"
        />
      </div>

      <ShoppingCart :totalPrice="order.totalPrice" title="Dina glas" :currency="currency" />
    </div>
  </div>
</template>