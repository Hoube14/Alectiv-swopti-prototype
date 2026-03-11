<script setup>
import { ref, computed } from 'vue';
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

const customerName = ref('');
const customerEmail = ref('');
const customerPhone = ref('');
const customerAddress1 = ref('');
const customerPostcode = ref('');
const customerCity = ref('');

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

function validateCustomerForm() {
  if (
    !customerName.value.trim() ||
    !customerEmail.value.trim() ||
    !customerAddress1.value.trim() ||
    !customerPostcode.value.trim() ||
    !customerCity.value.trim()
  ) {
    alert('Fyll i dina kund- och leveransuppgifter innan du går till betalning.');
    return false;
  }
  return true;
}

function getCheckoutEndpoint() {
  // When embedded in WordPress (GlasOnline), URL is set via wp_localize_script
  if (typeof window !== 'undefined' && window.glasonlineProductSelector?.createCheckoutUrl) {
    return window.glasonlineProductSelector.createCheckoutUrl;
  }
  return ''; // When not embedded, set glasonlineProductSelector.createCheckoutUrl to your Mollie create-payment URL.
}

// Build order line items for draft.order_payload_json (used by backend to create WC order in webhook).
function buildOrderPayloadFromSelections() {
  const sel = order.value?.selections ?? {};
  const shipping = storeData?.defaults?.shipping ?? 0;
  const total = totalPrice.value ?? 0;
  const productSubtotal = total - shipping;
  const productTitle = sel.glassType?.title
    ? `${sel.glassType.title}${sel.tintSelection?.title ? ` - ${sel.tintSelection.title}` : ' - ofärgade'}`
    : 'Glasögon';
  const lines = [{ name: productTitle, qty: 1, price: Math.round(productSubtotal * 100) / 100 }];
  if (shipping > 0) {
    lines.push({ name: 'Frakt', qty: 1, price: Math.round(shipping * 100) / 100 });
  }
  return lines;
}

// Checkout payload: amount, currency, redirect/cancel URLs, and draft (customer + order_payload_json) so backend can create WC order in webhook.
async function proceedToCheckout() {
  if (!validateCustomerForm()) {
    return;
  }
  try {
    const amount = Math.round(totalPrice.value * 100) / 100;
    const returnBase = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const q = returnBase && (returnBase.includes('?') ? '&' : '?');
    const redirectUrlParam = returnBase ? `${returnBase}${q}checkout=success` : undefined;
    const cancelUrlParam = returnBase ? `${returnBase}${q}checkout=cancel` : undefined;
    const payload = {
      amount,
      currency,
      redirectUrl: redirectUrlParam,
      cancelUrl: cancelUrlParam,
      draft: {
        order_payload_json: buildOrderPayloadFromSelections(),
        customer_name: customerName.value.trim(),
        customer_email: customerEmail.value.trim(),
        customer_phone: customerPhone.value.trim(),
        billing_address_1: customerAddress1.value.trim(),
        billing_postcode: customerPostcode.value.trim(),
        billing_city: customerCity.value.trim(),
        billing_country: 'SE',
        shipping_address_1: customerAddress1.value.trim(),
        shipping_postcode: customerPostcode.value.trim(),
        shipping_city: customerCity.value.trim(),
        shipping_country: 'SE'
      }
    };
    const response = await fetch(getCheckoutEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    const redirectUrl = data?.checkoutUrl ?? data?.url;
    if (redirectUrl) {
      sessionStorage.setItem('glasonline_checkout_order', JSON.stringify({
        selections: order.value?.selections ?? {},
        totalPrice: order.value?.totalPrice ?? 0,
        shipping: storeData?.defaults?.shipping ?? 0
      }));
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

          <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4" style="color: var(--color-heading)">Dina uppgifter</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Namn *</label>
                <input
                  v-model="customerName"
                  type="text"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  style="border-color: var(--color-border); color: var(--color-text); background-color: var(--color-background);"
                  placeholder="För- och efternamn"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">E-post *</label>
                <input
                  v-model="customerEmail"
                  type="email"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  style="border-color: var(--color-border); color: var(--color-text); background-color: var(--color-background);"
                  placeholder="namn@exempel.se"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Telefon</label>
                <input
                  v-model="customerPhone"
                  type="tel"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  style="border-color: var(--color-border); color: var(--color-text); background-color: var(--color-background);"
                  placeholder="Mobilnummer"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Adress *</label>
                <input
                  v-model="customerAddress1"
                  type="text"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  style="border-color: var(--color-border); color: var(--color-text); background-color: var(--color-background);"
                  placeholder="Gatuadress och nummer"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Postnummer *</label>
                <input
                  v-model="customerPostcode"
                  type="text"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  style="border-color: var(--color-border); color: var(--color-text); background-color: var(--color-background);"
                  placeholder="t.ex. 123 45"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Ort *</label>
                <input
                  v-model="customerCity"
                  type="text"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  style="border-color: var(--color-border); color: var(--color-text); background-color: var(--color-background);"
                  placeholder="Stad/ort"
                >
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