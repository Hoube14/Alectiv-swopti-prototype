<script setup>
import GlassTypeCard from '@/components/GlassTypeCard.vue';
import ProgressBar from '@/components/ProgressBar.vue';

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
</script>

<template>
  <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- progress bar at the top-->
       <ProgressBar :currentStep="1" :totalSteps="5"/>

      <!-- Page title -->
       <h1 class="text-center text-2xl font-medium mb-12">Välj glastyp</h1>

       <!-- Cards container -->
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols 4 gap-4">
          <!-- Card components-->
           <GlassTypeCard
          v-for="(glass, index) in glassTypes"
          :key:="index"
          :title="glass.title"
          :description="glass.description"
          :imageSrc="glass.imageSrc"
        />
      
        </div>
    </div>
  </div>
</template>
