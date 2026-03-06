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
      style="left: 14px; width: calc(100% - 28px); background-color: var(--color-border);"
    ></div>

    <!-- Filled track - from start toward end by progress -->
    <div
      v-if="totalSteps > 1 && currentStep >= 1"
      class="absolute h-1.5 rounded-full top-1/2 -translate-y-1/2 transition-all duration-300"
      :style="{
        left: '14px',
        width: `calc((100% - 28px) * ${Math.min(1, (currentStep - 1) / (totalSteps - 1))})`,
        backgroundColor: 'var(--color-primary)'
      }"
    ></div>

    <!-- Two points only: start (left) and end (right) -->
    <div class="relative flex justify-between" style="margin: 0 0;">
      <!-- Start point: current position -->
      <div class="flex items-center justify-center flex-shrink-0 w-7 h-7">
        <div
          class="rounded-full w-7 h-7 flex items-center justify-center border-2 bg-white"
          style="border-color: var(--color-primary);"
        >
          <div class="w-2 h-2 rounded-full" style="background-color: var(--color-primary);"></div>
        </div>
      </div>

      <!-- End point: goal -->
      <div class="flex items-center justify-center flex-shrink-0 w-7 h-7">
        <div
          v-if="currentStep >= totalSteps"
          class="rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-white transition-colors"
          style="background-color: var(--color-primary);"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div
          v-else
          class="rounded-full w-7 h-7 flex items-center justify-center border-2 bg-white"
          style="border-color: var(--color-border);"
        >
          <div class="w-2 h-2 rounded-full" style="background-color: var(--color-muted);"></div>
        </div>
      </div>
    </div>
  </div>
</template>
