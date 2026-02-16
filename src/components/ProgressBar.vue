<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="relative w-full my-8">
    <!-- Background track (light grey) -->
    <div 
      class="absolute h-1 bg-gray-300 top-1/2 -translate-y-1/2"
      style="left: 10px; width: calc(100% - 20px);"
    ></div>
    
    <!-- Filled track (dark blue) - from start to current step -->
    <div 
      v-if="totalSteps > 1 && currentStep >= 1"
      class="absolute h-1 top-1/2 -translate-y-1/2 bg-[#0B3A5A] transition-all duration-300"
      :style="{
        left: '10px',
        width: `calc((100% - 20px) * ${(currentStep - 1) / (totalSteps - 1)})`
      }"
    ></div>
    
    <!-- Steps container -->
    <div class="relative flex justify-between" style="margin: 0 10px;">
      <div 
        v-for="step in totalSteps" 
        :key="step" 
        class="relative flex items-center justify-center"
      >
        <!-- Completed step: solid dark blue circle with white checkmark -->
        <div 
          v-if="step < currentStep"
          class="rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 bg-[#0B3A5A]"
        >
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <!-- Current step: outlined dark blue circle with central dot -->
        <div 
          v-else-if="step === currentStep"
          class="rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 border-2 border-[#0B3A5A] bg-white"
        >
          <div class="w-1.5 h-1.5 bg-[#0B3A5A] rounded-full"></div>
        </div>
        <!-- Future step: outlined grey circle with central dot -->
        <div 
          v-else
          class="rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 border-2 border-gray-300 bg-white"
        >
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>
