<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import ProgressBar from '@/components/ProgressBar.vue';
import { useOrderStore } from '@/stores/orderStore';

const props = defineProps({
  currentStepIndex: Number,
  totalSteps: Number
});

const orderStore = useOrderStore();
const {
  order,
  priceModifiers,
  currentStore,
  stores,
  navigationHistory
} = storeToRefs(orderStore);
const { navigateTo, storeData } = orderStore;

function goBack() {
  if (navigationHistory.value && navigationHistory.value.length > 0) {
    const previousStepId = navigationHistory.value[navigationHistory.value.length - 1];
    navigateTo(previousStepId, true);
  } else {
    navigateTo('glassType', true);
  }
}

const totalPrice = computed(() => order.value?.totalPrice || 0)

const selections = computed(() => {
  return order?.value?.selections || [];
});

// Add currency computed property
const currency = computed(() => {
  return stores.value[currentStore.value]?.currency || 'SEK';
});

// Get product details for each selection for better display
const productDetails = computed(() => {
  const details = {};
  Object.entries(selections.value).forEach(([stepId, selection]) => {
    if (selection.title) {
      details[stepId] = {
        title: selection.title,
        price: selection.priceKey ? (priceModifiers.value?.[selection.priceKey] || 0) : 0
      };
    }
  });
  return details;
});

function getCheckoutEndpoint() {
  // When embedded in WordPress (GlasOnline), URL is set via wp_localize_script
  if (typeof window !== 'undefined' && window.glasonlineProductSelector?.createCheckoutUrl) {
    return window.glasonlineProductSelector.createCheckoutUrl;
  }
  return 'http://localhost:3001/create-checkout';
}

async function proceedToCheckout() {
  try {
    const response = await fetch(getCheckoutEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalPrice.value,
        currency: currency.value
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data && data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No URL in server response");
    }
  } catch (error) {
    alert('Det uppstod ett fel vid betalning: ' + error.message);
  }
}
</script>

<template>
  <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :current-step="currentStepIndex" :total-steps="totalSteps" />
      
      <div class="flex items-center mb-8">
        <button @click="goBack" class="mr-4 text-gray-600">
          <span><- Tillbaka</span>
        </button>
        <h1 class="text-center text-2xl font-medium">Din beställning</h1>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-xl font-bold mb-4">Sammanfattning</h2>
        
        <div class="mb-6">
          <!-- Header row -->
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium">Produkt</span>
            <span class="font-medium">Pris</span>
          </div>
          
          <!-- Product selection section -->
          <div class="py-4 border-b">
            <div class="mb-2">
              <span class="font-medium">Dina val:</span>
            </div>
            
            <!-- Product details section -->
            <div class="mt-4 space-y-4">
              <!-- Main product title -->
              <div v-if="selections.glassType">
                <div class="font-medium">{{ selections.glassType.title }} - {{ selections.tintSelection?.title || 'ofärgade' }}</div>
                <div>{{ totalPrice - storeData?.defaults?.shipping || 0 }} {{ currency }}</div>
              </div>
              
              <!-- Product attributes -->
              <div class="space-y-2 text-gray-600 text-sm">

                <div v-if="selections.photochromicColorSelection">
                  <div>Färgskiftande glas: {{ selections.photochromicColorSelection.title }}</div>
                </div>

                <div v-if="selections.colorSelection">
                  <div>Färg: {{ selections.colorSelection.title }}</div>
                </div>

                <div v-if="selections.usage">
                  <div>Hur ska du använda dina glasögon?: {{ selections.usage.title }}</div>
                </div>

                <div v-if="selections.glassType">
                  <div>Typ av glas: {{ selections.glassType.title }}</div>
                </div>

                <div v-if="selections.prescription">
                  <div>Recept: {{ selections.prescription.title }}</div>
                </div>

                <div v-if="selections.lensBrand">
                  <div>Glasmärke: {{ selections.lensBrand.title }}</div>
                </div>

                <div v-if="selections.lensRecommendation">
                  <div>Glas: {{ selections.lensRecommendation.title }}</div>
                </div>

                <div v-if="selections.treatment">
                  <div>Behandling: {{ selections.treatment.title }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between py-2">
            <span>Frakt</span>
            <span>{{ storeData?.defaults?.shipping || 0 }} {{ currency }}</span>
          </div>
          
          <div class="flex justify-between py-2 mt-4 border-t-2 font-bold">
            <span>Totalt att betala</span>
            <span>{{ totalPrice.toFixed(2) }} {{ currency }}</span>
          </div>
        </div>
        
        <button 
          @click="proceedToCheckout" 
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Gå till betalning
        </button>
      </div>
      
      <div class="mt-4 text-center text-sm text-gray-500">
        Skatt ingår. Leverans och rabatter beräknas i kassan.
      </div>
    </div>
  </div>
</template>