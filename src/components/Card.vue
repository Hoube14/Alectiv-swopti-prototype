<script setup>

defineProps({
  title: String,
  description: String,
  imageSrc: String,
  price: Number,
  currency: String
});

defineEmits(['click']);

</script>

<template>
  <div @click="$emit('click')" class="border rounded-lg p-6 flex flex-col items-center bg-white bg-opacity-10 cursor-pointer">
    <!-- Only render image if imageSrc exists -->
    <div v-if="imageSrc" class="mb-4">
      <img :src="imageSrc" :alt="title" class="h-24">
    </div>
    <h3 class="font-medium text-lg mb-2 text-center">{{ title }}</h3>
    <p class="text-sm text-center text-gray-600">{{ description }}</p>

    <!-- Display price if available -->
    <div v-if="price !== undefined" class="mt-2 font-medium text-gray-800">
      {{ price }} {{ currency }}
    </div>
  </div>
</template>