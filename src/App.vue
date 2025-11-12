<script setup>
import { provide, ref, computed } from 'vue';
import Selectionpage from './views/Selectionpage.vue';
import productData from '../products.json';
import SummaryPage from './views/SummaryPage.vue';

const currentStore = ref('store_1')
const stores = computed(() => productData.stores)
const activeStore = computed(() => stores.value[currentStore.value])
const priceModifiers = computed(() => activeStore.value?.priceModifiers || {})

const steps = ref([
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
          priceKey: 'glass_single',
          nextStep: 'tintSelection'
      
        },
        {
          title: "Progressiva glas",
          description: "Glas med flera styrkor. Korrigerar synfel för avstånd och nära",
          imageSrc: "/images/Progressiva.png",
          priceKey: 'glass_progressive',
          nextStep: 'tintSelection'
        },
        {
          title: "Glas utan styrka",
          description: "Helt utan styrka. I nästa steg väljer du till exempel blåljusglas eller solglas.",
          imageSrc: "/images/Enkelslipad.png",
          priceKey: 'glass_single',
          nextStep: 'tinteSelection'
    
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
      id: 'tintSelection',
      title: 'Välj toning',
      showBackButton: true,
      backStep: 'glassType',
      options: [
      {
        title: "Ofärgade glas",
        description: "I nästa steg kan du lägga till blåljusfilter som tillval.",
        imageSrc: "/images/Ofargade.png",
        priceKey: 'tint_none',
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
        priceKey: 'tint_gradient'
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
      backStep: 'tintSelection',
      options: [
        {
          title: "Enkelslipade glas - ofärgade",
          imageSrc: "/images/Enkelslipad.png",
          nextStep: 'frame'
        },
        {
          title: "Enkelslipade glas - blåljusfiltrerande",
          imageSrc: "/images/blafilter.webp",
          nextStep: 'frame'
        }
      ]
    },
    {
      id: 'frame',
      title: 'Välj båge',
      showBackButton: true,
      backStep: 'glass',
      options: [
        {
          title: "Standard båge",
          description: "Standard båge med lätt design.",
          priceKey: 'frame_basic',
          nextStep: "usage"
        },
        {
          title: "Premium båge",
          description: "Lyxig design med premium material",
          priceKey: 'frame_premium',
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
          nextStep: 'summary'
        }
      ]
    },
    {
      id: 'summary',
      title: 'sammanfattning',
      showBackButton: true,
      backStep: 'usage'
    }
  ]
)

const currentStepId = ref('glassType')

const order = ref({
  selections: {},
  totalPrice: 0
})

// Get the current step object
const currentStep = computed(() => 
  steps.value.find(step => step.id === currentStepId.value)
);

// Get the current step index (for progress bar)
const currentStepIndex = computed(() =>
  steps.value.findIndex(step => step.id === currentStepId.value) + 1
)

function navigateTo(stepId) {
  currentStepId.value = stepId

  if (stepId === 'summary') {
    calculateTotalPrice();
  }
}

function updateOrder(stepId, selection) {
  if (!order.value.selections) {
    order.value.selections = {};
  }
  
  order.value.selections[stepId] = selection;
  
  calculateTotalPrice();
}

function calculateTotalPrice() {
  let total = 0;
  
  Object.values(order.value.selections).forEach(selection => {
    if (selection && selection.priceKey) {
      total += priceModifiers.value[selection.priceKey] || 0;
    }
  });
  
  if (currentStepId.value === 'summary') {
    total += productData.defaults.shipping;
    total += total * (productData.defaults.taxPercent / 100);
  }
  
  // Uppdate order.totalPrice
  order.value.totalPrice = total;
}

function switchStore(storeId) {
  currentStore.value = storeId;
  calculateTotalPrice();
}

// Provide the order object and navigation function to children
provide('order', order);
provide('navigateTo', navigateTo);
provide('updateOrder', updateOrder);
provide('stores', stores);
provide('currentStore', currentStore);
provide('swtichStore', switchStore);
provide('priceModifiers', priceModifiers);
provide('storeData', productData);

</script>

<template>
  <div>
    <div class="bg-blue-100 p-4 mb-4">
      <label class="mr-2">Välj butik:</label>
      <select v-model="currentStore" @change="calculateTotalPrice" class="border p-2 rounded">
        <option v-for="(store, id) in stores" :key="id" :value="id">
          {{ store.name }} ({{ store.currency }})
        </option>
      </select>
    </div>
  </div>

  <Selectionpage 
    v-if="currentStepId !== 'summary'"
    :step="currentStep"
    :currentStepIndex="currentStepIndex"
    :totalSteps="steps.length"
    />

    <SummaryPage
    v-else
    :currentStepIndex="currentStepIndex"
    :totalSteps="steps.length"
    />
</template>

<style scoped></style>
