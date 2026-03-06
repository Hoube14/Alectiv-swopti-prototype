<script setup>

defineProps({
  title: String,
  description: String,
  imageSrc: String,
  price: Number,
  currency: String,
  recommended: Boolean
});

defineEmits(['click']);

</script>

<template>
  <div
    @click="$emit('click')"
    class="h-full rounded-2xl border p-6 flex flex-col items-center cursor-pointer shadow-sm transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md"
    style="background-color: var(--color-card); border-color: var(--color-border)"
  >
    <!-- Only render image if imageSrc exists -->
    <div v-if="imageSrc" class="mb-4 flex-shrink-0">
      <img :src="imageSrc" :alt="title" class="h-24 object-contain">
    </div>
    <h3 class="font-semibold text-lg mb-2 text-center flex-shrink-0" style="color: var(--color-heading)">{{ title }}</h3>
    <p v-if="recommended" class="text-xs font-medium mb-1 flex-shrink-0" style="color: var(--color-primary)">Rekommenderas för dina styrkor</p>
    <p class="text-sm text-center flex-1 min-h-0 leading-relaxed" style="color: var(--color-text)">{{ description }}</p>

    <!-- Display price if available -->
    <div v-if="price !== undefined" class="mt-2 font-semibold flex-shrink-0" style="color: var(--color-heading)">
      {{ price }} {{ currency }}
    </div>
  </div>
</template>