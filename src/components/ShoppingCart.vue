<script setup>
import { ref } from 'vue';

defineProps({
  totalPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'kr'
  },
  title: {
    type: String,
    default: 'Dina glas'
  }
})

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

</script>

<template>
  <div v-if="!isExpanded" 
       @click="toggleExpand"
       class="fixed bottom-0 left-0 right-0 bg-custom-wheat py-2 border-t border-gray-200 cursor-pointer">
    <div class="flex justify-center items-center">
      <div class="flex items-center gap-4">
        <span class="text-gray-700">{{ title }}</span>
        <div class="flex items-center">
          <span>{{ totalPrice }} {{ currency }}</span>
          <svg 
            class="ml-2 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Expanded view when expanded - modal panel -->
  <div v-if="isExpanded" class="fixed bottom-0 left-0 right-0 flex justify-center items-end">
    <!-- Modal panel with limited width -->
    <div class="bg-white border border-gray-200 rounded-t-lg shadow-lg w-full max-w-md">
      <!-- Header with close button -->
      <div class="flex justify-between items-center p-4">
        <h2 class="text-lg font-medium text-gray-900">Nya glas i egen båge</h2>
        <button @click="toggleExpand" class="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="border-t border-gray-200"></div>
      
      <div class="p-4">
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-700">Totalt</span>
          <span class="text-gray-900">{{ totalPrice }} {{ currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>