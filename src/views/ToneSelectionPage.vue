<script setup>
import { inject } from 'vue';
import GlassTypeCard from '@/components/GlassTypeCard.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';

// Get shared state and functions
const order = inject('order');
const navigateTo = inject('navigateTo');
const updateOrder = inject('updateOrder');

const toneTypes = [
  {
    title: "Ofärgade glas",
    description: "I nästa steg kan du lägga till blåljusfilter som tillval.",
    imageSrc: "/images/Ofargade.png",
  },
  {
    title: "Solglas",
    description: "Välj färg och om du vill ha polariserade glas i nästa steg.",
    imageSrc: "/images/Solglas.png",
  },
  {
    title: "Heltonade glas",
    description: "Välj mellan 12-65% toning i nästa steg.",
    imageSrc: "/images/Heltonade.png",
  },
  {
    title: "Gradalttonade glas",
    description: "Tonas successivt - Mörkare upptill, ljusare nedtill.",
    imageSrc: "/images/Gradaltonade.png",
  },
  {
    title: "Färgskiftande glas",
    description: "Klara inomhus - mörknar i solen.",
    imageSrc: "/images/Fargskiftande.gif",
  }
];

// Handle selection of tone type
function selectToneType(index) {
  // Save selection
  updateOrder('toneType', toneTypes[index]);
  
  // Navigate to next step (not implemented yet)
  console.log(`Selected tone: ${toneTypes[index].title}`);
}

function goBack() {
  navigateTo('glassType');
}
</script>

<template>
  <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :currentStep="2" :totalSteps="5" />
      
      <div class="flex items-center mb-8">
        <button @click="goBack" class="mr-4 text-blue-600">
          <span>← Tillbaka</span>
        </button>
        <h1 class="text-center text-2xl font-medium">Välj toning</h1>
      </div>
      
      <!-- Cards container -->
      <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <GlassTypeCard 
          v-for="(tone, index) in toneTypes"
          :key="index"
          :title="tone.title"
          :description="tone.description"
          :imageSrc="tone.imageSrc"
          @click="selectToneType(index)"
        />
      </div>
      
      <ShoppingCart :totalPrice="order.totalPrice" title="Dina glas" currency="kr" />
    </div>
  </div>
</template>