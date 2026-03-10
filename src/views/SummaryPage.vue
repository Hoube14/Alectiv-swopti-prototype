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

const currency = 'SEK';

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

// Checkout payload: amount (order total from store: selections + tax + shipping), currency (SEK).
// Same shape for Stripe create-checkout and Mollie create-payment.
async function proceedToCheckout() {
  try {
    const amount = Math.round(totalPrice.value * 100) / 100;
    const response = await fetch(getCheckoutEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    const redirectUrl = data?.checkoutUrl ?? data?.url;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error("No checkout URL in server response");
    }
  } catch (error) {
    alert('Det uppstod ett fel vid betalning: ' + error.message);
  }
}
</script>

<template>
  <div class="min-h-screen p-6 md:p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :current-step="currentStepIndex" :total-steps="totalSteps" />

      <div class="flex items-center mb-8">
        <button
          @click="goBack"
          class="mr-4 text-sm font-medium transition hover:opacity-80"
          style="color: var(--color-primary)"
        >
          <span>← Tillbaka</span>
        </button>
        <h1 class="text-center text-2xl md:text-3xl font-semibold flex-1" style="color: var(--color-heading)">Din beställning</h1>
      </div>

      <div class="rounded-2xl border shadow-md p-6 md:p-8" style="background-color: var(--color-card); border-color: var(--color-border)">
        <h2 class="text-xl font-semibold mb-4" style="color: var(--color-heading)">Sammanfattning</h2>

        <div class="mb-6">
          <!-- Header row -->
          <div class="flex justify-between py-2 border-b" style="border-color: var(--color-border)">
            <span class="font-medium" style="color: var(--color-text)">Produkt</span>
            <span class="font-medium" style="color: var(--color-text)">Pris</span>
          </div>

          <!-- Product selection section -->
          <div class="py-4 border-b" style="border-color: var(--color-border)">
            <div class="mb-2">
              <span class="font-medium" style="color: var(--color-heading)">Dina val:</span>
            </div>

            <!-- Product details section -->
            <div class="mt-4 space-y-4">
              <!-- Main product title -->
              <div v-if="selections.glassType">
                <div class="font-medium" style="color: var(--color-heading)">{{ selections.glassType.title }} - {{ selections.tintSelection?.title || 'ofärgade' }}</div>
                <div style="color: var(--color-text)">{{ totalPrice - storeData?.defaults?.shipping || 0 }} {{ currency }}</div>
              </div>

              <!-- Product attributes -->
              <div class="space-y-2 text-sm" style="color: var(--color-text)">

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
          
          <div class="flex justify-between py-2" style="color: var(--color-text)">
            <span>Frakt</span>
            <span>{{ storeData?.defaults?.shipping || 0 }} {{ currency }}</span>
          </div>

          <div class="flex justify-between py-2 mt-4 border-t-2 font-semibold" style="border-color: var(--color-border); color: var(--color-heading)">
            <span>Totalt att betala</span>
            <span>{{ totalPrice.toFixed(2) }} {{ currency }}</span>
          </div>
        </div>

        <button
          @click="proceedToCheckout"
          class="w-full py-3.5 text-white rounded-xl font-semibold shadow-sm transition hover:opacity-95"
          style="background-color: var(--color-primary);"
        >
          Gå till betalning
        </button>
      </div>

      <div class="mt-4 text-center text-sm" style="color: var(--color-muted)">
        Skatt ingår. Leverans och rabatter beräknas i kassan.
      </div>
    </div>
  </div>
</template>