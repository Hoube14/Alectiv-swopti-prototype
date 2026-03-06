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
    <!-- Background track -->
    <div
      class="absolute h-1.5 rounded-full top-1/2 -translate-y-1/2 transition-all duration-300"
      style="left: 10px; width: calc(100% - 20px); background-color: var(--color-border);"
    ></div>

    <!-- Filled track (primary) - from start to current step -->
    <div
      v-if="totalSteps > 1 && currentStep >= 1"
      class="absolute h-1.5 rounded-full top-1/2 -translate-y-1/2 transition-all duration-300"
      :style="{
        left: '10px',
        width: `calc((100% - 20px) * ${(currentStep - 1) / (totalSteps - 1)})`,
        backgroundColor: 'var(--color-primary)'
      }"
    ></div>

    <!-- Steps container -->
    <div class="relative flex justify-between" style="margin: 0 10px;">
      <div
        v-for="step in totalSteps"
        :key="step"
        class="relative flex items-center justify-center"
      >
        <!-- Completed step: solid primary circle with white checkmark -->
        <div
          v-if="step < currentStep"
          class="rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-white transition-colors"
          style="background-color: var(--color-primary);"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <!-- Current step: outlined primary circle with central dot -->
        <div
          v-else-if="step === currentStep"
          class="rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 border-2 bg-white"
          style="border-color: var(--color-primary);"
        >
          <div class="w-2 h-2 rounded-full" style="background-color: var(--color-primary);"></div>
        </div>
        <!-- Future step -->
        <div
          v-else
          class="rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 border-2 bg-white"
          style="border-color: var(--color-border);"
        >
          <div class="w-2 h-2 rounded-full" style="background-color: var(--color-muted);"></div>
        </div>
      </div>
    </div>
  </div>
</template>
