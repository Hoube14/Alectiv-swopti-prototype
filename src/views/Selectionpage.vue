<script setup>
import { inject } from 'vue';
import Card from '@/components/Card.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';

// Props to make page dynamic
const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  currentStepIndex: Number,
  totalSteps: Number
})

// Get shared state and functions
const order = inject('order')
const updateOrder = inject('updateOrder')
const navigateTo = inject('navigateTo')

function handleSelection(option, index) {
  updateOrder(props.step.id, option);

  // Check if this is terminal glasses from the first step
  const isTerminalPath = order.value.selections.glassType?.title === "Terminalglas";
  
  // Special handling for frame selection in terminal path
  if (props.step.id === 'frame' && isTerminalPath) {
    navigateTo('prescription'); // Skip usage for terminal glasses
  } else if (option.nextStep) {
    navigateTo(option.nextStep); // Normal flow
  }
}

function goBack() {
  if (props.step.backStep) {
    navigateTo(props.step.backStep)
  }
}
</script>

<template>
  <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :current-step="currentStepIndex" :total-steps="totalSteps" />

      <div class="flex items-center mb-8">
        <button v-if="step.showBackButton" @click="goBack" class="mr-4 text-gray-600">
          <span><- Tillbaka</span>
        </button>
        <h1 class="text-center text-2xl font-medium">{{ step.title }}</h1>
      </div>

      <!-- Cards container -->
       <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <Card
          v-for="(option, index) in step.options"
          :key="index"
          :title="option.title"
          :description="option.description"
          :imageSrc="option.imageSrc"
          @click="handleSelection(option, index)"
          />
       </div>

       <ShoppingCart :totalPrice="order.totalPrice" title="Dina glas" currency="kr" />
    </div>
  </div>


</template>