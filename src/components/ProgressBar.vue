<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    default: 5
  }
})
</script>

<template>
  <div class="relative w-full my-8">
    <!-- Track line -->
    <div class="absolute h-[1px] bg-gray-300 top-1/2 left-0 right-0 -translate-y-1/2"></div>
    
    <!-- Steps container -->
    <div class="relative flex justify-between">
      <div 
        v-for="step in totalSteps" 
        :key="step" 
        class="relative"
      >
        <div 
          :class="[
            'rounded-full w-5 h-5 flex items-center justify-center',
            step === currentStep 
              ? 'border-2 border-stone-800' 
              : step < currentStep
                ? 'bg-stone-800 flex items-center justify-center'
                : 'border border-gray-300 bg-white' 
          ]"
        >
          <div 
            v-if="step === currentStep" 
            class="w-1 h-1 bg-stone-800 rounded-full"
          ></div>
         </div>
        </div>
      </div>
     </div>
</template>