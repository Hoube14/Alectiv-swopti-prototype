<script setup>

defineProps({
  title: String,
  description: String,
  imageSrc: String,
  /** When set with imageSrc, renders a light-to-dark crossfade animation (e.g. färgskiftande glas) */
  imageSrcDark: String,
  price: Number,
  priceLabel: String,
  currency: String,
  recommended: Boolean,
  disabled: Boolean
});

defineEmits(['click']);

</script>

<template>
  <div
    @click="disabled ? undefined : $emit('click')"
    class="h-full rounded-2xl border p-6 flex flex-col items-center shadow-sm transition-all duration-200 ease-out"
    :class="disabled ? 'cursor-default opacity-95' : 'cursor-pointer hover:scale-[1.03] hover:shadow-md'"
    style="background-color: var(--color-card); border-color: var(--color-border)"
  >
    <!-- Only render image if imageSrc exists -->
    <div v-if="imageSrc" class="mb-4 flex-shrink-0 h-24 flex items-center justify-center relative w-full">
      <!-- Animated pair: light ↔ dark crossfade -->
      <template v-if="imageSrcDark">
        <img :src="imageSrc" :alt="title" class="h-24 object-contain absolute inset-0 m-auto photochromic-light">
        <img :src="imageSrcDark" :alt="title" class="h-24 object-contain absolute inset-0 m-auto photochromic-dark">
      </template>
      <img v-else :src="imageSrc" :alt="title" class="h-24 object-contain">
    </div>
    <h3 class="font-semibold text-lg mb-2 text-center flex-shrink-0" style="color: var(--color-heading)">{{ title }}</h3>
    <p v-if="recommended" class="text-xs font-bold mb-1 flex-shrink-0" style="color: var(--color-recommended)">Rekommenderas för dina styrkor</p>
    <p class="text-sm text-center flex-1 min-h-0 leading-relaxed" style="color: var(--color-text)">{{ description }}</p>

    <!-- Display price label (e.g. included) or price if available -->
    <div v-if="priceLabel" class="mt-2 font-semibold flex-shrink-0" style="color: var(--color-heading)">
      {{ priceLabel }}
    </div>
    <div v-else-if="price !== undefined" class="mt-2 font-semibold flex-shrink-0" style="color: var(--color-heading)">
      {{ price }} {{ currency }}
    </div>
  </div>
</template>

<style scoped>
@keyframes photochromic-light {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes photochromic-dark {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
.photochromic-light {
  animation: photochromic-light 4s ease-in-out infinite;
}
.photochromic-dark {
  animation: photochromic-dark 4s ease-in-out infinite;
}
</style>