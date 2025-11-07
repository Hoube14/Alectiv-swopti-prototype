<script setup>
import GlassTypeCard from '@/components/GlassTypeCard.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';
import { inject } from 'vue';

// Get shared state and functions
const currentView = inject('currentView');
const order = inject('order');
const navigateTo = inject('navigateTo');
const updateOrder = inject('updateOrder');

const glassTypes = [
  {
    title: "Enkelslipade glas",
    description: "Glas som korrigerar ett synfel - avstånd eller nära.",
    imageSrc: "/images/Enkelslipad.png"
  },
  {
    title: "Progressiva glas",
    description: "Glas med flera styrkor. Korrigerar synfel för avstånd och nära.",
    imageSrc: "/images/Progressiva.png"
  },
  {
    title: "Glas utan styrka",
    description: "Helt utan styrka. I nästa steg väljer du till exempel blåljusglas eller solglas.",
    imageSrc: "/images/Enkelslipad.png"
  },
  {
    title: "Terminalglas",
    description: "Enkelslipade glas avsedda för jobb framför datorn. Ger extra läs-styrka.",
    imageSrc: "/images/Terminal.png"
  }
]

function selectGlassType(index) {
  // Save the selection
  updateOrder('glassType', glassTypes[index]);
  
  // Navigate based on selection
  if (glassTypes[index].title !== "Terminalglas") {
    navigateTo('toneSelection');
  } else {
    // Special handling for terminal glasses
    console.log("Terminal should not go to tone selection");
  }
}
</script>

<template>
 <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- progress bar -->
      <ProgressBar :currentStep="1" :totalSteps="5" />
      
      <h1 class="text-center text-2xl font-medium mb-12">Välj glastyp</h1>
      
      <!-- Cards container -->
      <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <GlassTypeCard 
          v-for="(glass, index) in glassTypes"
          :key="index"
          :title="glass.title"
          :description="glass.description"
          :imageSrc="glass.imageSrc"
          @click="selectGlassType(index)"
        />
      </div>

      <ShoppingCart :totalPrice="order.totalPrice" title="Dina glas" currency="kr" />
    </div>
  </div>
</template>
