<script setup>
import { provide, ref, computed } from 'vue';
import Selectionpage from './views/Selectionpage.vue';

const steps = [
    {
      id: 'glassType',
      title: 'Välj glastyp',
      showBackButton: false,
      backStep: null,
      options: [
      {
        title: "Enkelslipade glas",
        description: "Glas som korrigerar ett synfel - avstånd eller nära.",
        imageSrc: "/images/Enkelslipad.png",
        nextStep: 'toneSelection'
    
      },
      {
        title: "Progressiva glas",
        description: "Glas med flera styrkor. Korrigerar synfel för avstånd och nära",
        imageSrc: "/images/Progressiva.png",
        nextStep: 'toneSelection'
    
      },
      {
        title: "Glas utan styrka",
        description: "Helt utan styrka. I nästa steg väljer du till exempel blåljusglas eller solglas.",
        imageSrc: "/images/Enkelslipad.png",
        nextStep: 'toneSelection'
    
      },
      {
        title: "Terminalglas",
        description: "Enkelslipade glas avsedda för jobb framför datorn. Ger extra läs-styrka.",
        imageSrc: "/images/Terminal.png",
        nextStep: 'specialoption' 
    
      }
   ]
  },
  {
    id: 'toneSelection',
    title: 'Välj toning',
    showBackButton: true,
    backStep: 'glassType',
    options: [
    {
      title: "Ofärgade glas",
      description: "I nästa steg kan du lägga till blåljusfilter som tillval.",
      imageSrc: "/images/Ofargade.png",
      nextStep: 'glass'
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
    ]
  },
  {
    id: 'glass',
    title: 'Välj glas',
    showBackButton: true,
    backStep: 'toneSelection',
    options: [
      {
        title: "Enkelslipade glas - ofärgade",
        imageSrc: "/images/Enkelslipad.png",
        price: 1.499,
        currency: "kr",
        nextStep: 'frame'
      },
      {
        title: "Enkelslipade glas - blåljusfiltrerande",
        imageSrc: "/images/blafilter.webp",
        price: 1.999,
        currency: "kr",
        nextStep: 'frame'
      }
    ]
  },
  {
    id: 'frame',
    title: 'Vilken typ av båge har du?',
    showBackButton: true,
    backStep: 'glass',
    options: [
      {
        title: "Med ram",
        description: "Vanlig båge med ram. Ingen extra kostnad tillkommer.",
        price: 0,
        currency: "kr",
        nextStep: "usage"
      },
      {
        title: "Ramlös / Delvis ramlös",
        description: "Extra kostnad för montering och polering av kanter.",
        price: 500,
        currency: "kr",
        nextStep: "usage"
      }
    ]
  },
  {
    id:'usage',
    title:'Hur ska du använda din glasögon?',
    showBackButton:true,
    backStep:'frame',
    options: [
      {
        title: "Avstånd / Allround",
        description: "Bra i vardagen (t.ex. bilkörning, tv). Välj detta för glasögon som används hela dagen.",
        price: 0,
        currency: "kr"
      }
    ]
  }
]

const currentStepId = ref('glassType')

const order = ref({
  totalPrice: 0
})

// Get the current step object
const currentStep = computed(() => 
  steps.find(step => step.id === currentStepId.value)
);

// Get the current step index (for progress bar)
const currentStepIndex = computed(() =>
  steps.findIndex(step => step.id === currentStepId.value) + 1
)

function navigateTo(stepId) {
  currentStepId.value = stepId
}

function updateOrder(key, value) {
  order.value[key] = value

  calculateTotalPrice()
}

function calculateTotalPrice() {
  order.value.totalPrice = 0
}

// Provide the order object and navigation function to children
provide('order', order);
provide('navigateTo', navigateTo);
provide('updateOrder', updateOrder);
</script>

<template>
  <Selectionpage 
    :step="currentStep"
    :currentStepIndex="currentStepIndex"
    :totalSteps="steps.length"
    />
</template>

<style scoped></style>
