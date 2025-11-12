<script setup>
import { inject, computed } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue';

const props = defineProps({
  currentStepIndex: Number,
  totalSteps: Number
});

const order = inject('order');
const navigateTo = inject('navigateTo');
const storeData = inject('storeData', {}); 
const priceModifiers = inject('priceModifiers');

const totalPrice = computed(() => {
  if (!order?.value?.totalPrice) return 0;
  return order.value.totalPrice;
});

const selections = computed(() => {
  return order?.value?.selections || [];
});

function getPriceForSelection(selection) {
  if (!selection || !selection.priceKey) return 0;
  return priceModifiers?.value?.[selection.priceKey] || 0;
  
}

function calculateTax() {
  let subtotal = 0;
  
  if (!order?.value?.selections) return "0.00";
  
  Object.values(selections.value).forEach(selection => {
    if (selection && selection.priceKey) {
      subtotal += priceModifiers?.value?.[selection.priceKey] || 0;
    }
  });
  
  subtotal += storeData?.defaults?.shipping || 0;

  return ((subtotal * (storeData?.defaults?.taxPercent || 0) / 100)).toFixed(2);
}

function proceedToCheckout() {
  console.log('Gå vidare till Stripe Checkout:', totalPrice.value);
  alert('Redirecting to Stripe Checkout (test mode)');
}
</script>

<template>

  <div class="py-4 border-b">
</div>
  <div class="min-h-screen bg-orange-100 p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :current-step="currentStepIndex" :total-steps="totalSteps" />
      
      <div class="flex items-center mb-8">
        <button @click="navigateTo('usage')" class="mr-4 text-gray-600">
          <span><- Tillbaka</span>
        </button>
        <h1 class="text-center text-2xl font-medium">Din beställning</h1>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-xl font-bold mb-4">Sammanfattning</h2>
        
        <div class="mb-6">
          <div class="flex justify-between py-2 border-b">
            <span class="font-medium">Produkt</span>
            <span class="font-medium">Pris</span>
          </div>
          
       <div class="py-4 border-b">
          <div class="mb-2">
            <span class="font-medium">Dina val:</span>
          </div>
          
          <ul class="list-disc pl-5">
            <li v-for="value in selections"> {{ value.priceKey }} 

            </li>
          </ul> 
        </div>
          
          <div class="flex justify-between py-2">
            <span>Frakt</span>
            <span>{{ storeData?.defaults?.shipping || 0 }} kr</span>
          </div>
          
          <div class="flex justify-between py-2">
            <span>Moms ({{ storeData?.defaults?.taxPercent || 0 }}%)</span>
            <span>{{ calculateTax() }} kr</span>
          </div>
          
          <div class="flex justify-between py-2 mt-4 border-t-2 font-bold">
            <span>Totalt att betala</span>
            <span>{{ totalPrice.toFixed(2) }} kr</span>
          </div>
        </div>
        
        <button 
          @click="proceedToCheckout" 
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Gå till betalning
        </button>
      </div>
    </div>
  </div>
</template>