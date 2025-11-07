<script setup>

defineProps({
  title: String,
  description: String,
  imageSrc: String,
  price: Number
});

defineEmits(['click']);
</script>

<template>
  <div @click="$emit('click')" class="border rounded-lg p-6 flex flex-col items-center bg-white bg-opacity-10 cursor-pointer">
    <div class="mb-4">
      <img :src="imageSrc" :alt="title" class="h-24">
    </div>
    <h3 class="font-medium text-lg mb-2">{{ title }}</h3>
    <p class="text-sm text-center text-gray-600">{{ description }}</p>
  </div>
</template>