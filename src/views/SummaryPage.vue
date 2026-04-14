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

// Per-field validation errors (key = field name, value = error message or empty)
const formErrors = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress1: '',
  customerPostcode: '',
  customerCity: ''
});
const formTouched = ref(false); // true after first submit attempt, to show errors

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

const coloredGlassTypeTitle = computed(() => order.value?.selections?.coloredGlassType?.title || null);

const helfargSummaryText = computed(() => {
  const sel = order.value?.selections ?? {};
  if (coloredGlassTypeTitle.value !== 'Helfärg') return null;

  // Standardfärger: user picks a darkness first, then a color.
  if (sel.darknessSelection?.title && sel.colorSelection?.title) {
    const pct = sel.darknessSelection.title.match(/\d+%/)?.[0];
    if (pct) return `${pct} ${sel.colorSelection.title}`;
    return `${sel.darknessSelection.title} ${sel.colorSelection.title}`;
  }

  // Modefärger: the option title already encodes the percent.
  if (sel.fashionColorSelection?.title) {
    return sel.fashionColorSelection.title;
  }

  return null;
});

const gradalSummaryText = computed(() => {
  const sel = order.value?.selections ?? {};
  if (coloredGlassTypeTitle.value !== 'Gradal') return null;

  // Standardfärger: user picks a gradient intensity first, then a color.
  if (sel.gradientTintSelection?.title && sel.colorSelection?.title) {
    return `${sel.gradientTintSelection.title} i ${sel.colorSelection.title}`;
  }

  // Modefärger: the option title already encodes both style and intensity.
  if (sel.gradientFashionSelection?.title) {
    return sel.gradientFashionSelection.title;
  }

  return null;
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

// Simple email format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Swedish postcode: 5 digits, optional space between 3 and 2
const postcodeRegex = /^\d{3}\s?\d{2}$/;
// Phone: digits, spaces, +, - only; 7–15 digits for length
function phoneDigitsOnly(str) {
  const d = str.replace(/\D/g, '');
  return d.length >= 7 && d.length <= 15;
}
// Name: only letters, spaces, hyphens (no digits)
const nameOnlyLettersRegex = /^[\p{L}\p{M}\s\-]+$/u;

function validateCustomerForm() {
  formTouched.value = true;
  const err = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress1: '',
    customerPostcode: '',
    customerCity: ''
  };

  const name = customerName.value.trim();
  if (!name) {
    err.customerName = 'Ange för- och efternamn';
  } else if (name.length < 2) {
    err.customerName = 'Namnet är för kort';
  } else if (!nameOnlyLettersRegex.test(name)) {
    err.customerName = 'Namnet får bara innehålla bokstäver (inga siffror)';
  }

  const email = customerEmail.value.trim();
  if (!email) {
    err.customerEmail = 'Ange e-postadress';
  } else if (!emailRegex.test(email)) {
    err.customerEmail = 'Ange en giltig e-postadress';
  }

  const phone = customerPhone.value.trim();
  if (phone && !phoneDigitsOnly(phone)) {
    err.customerPhone = 'Ange ett giltigt telefonnummer (7–15 siffror)';
  }

  const address = customerAddress1.value.trim();
  if (!address) {
    err.customerAddress1 = 'Ange gatuadress';
  } else if (address.length < 3) {
    err.customerAddress1 = 'Adressen är för kort';
  }

  const postcodeRaw = customerPostcode.value.trim();
  if (!postcodeRaw) {
    err.customerPostcode = 'Ange postnummer';
  } else if (!postcodeRegex.test(postcodeRaw)) {
    err.customerPostcode = 'Ange ett giltigt postnummer (t.ex. 123 45)';
  }

  const city = customerCity.value.trim();
  if (!city) {
    err.customerCity = 'Ange ort';
  } else if (city.length < 2) {
    err.customerCity = 'Orten är för kort';
  }

  formErrors.value = err;
  return !Object.values(err).some(Boolean);
}

function getCheckoutEndpoint() {
  // When embedded in WordPress (GlasOnline), URL is set via wp_localize_script
  if (typeof window !== 'undefined' && window.glasonlineProductSelector?.createCheckoutUrl) {
    return window.glasonlineProductSelector.createCheckoutUrl;
  }
  return ''; // When not embedded, set glasonlineProductSelector.createCheckoutUrl to your Mollie create-payment URL.
}

function getTestOrderEndpoint() {
  if (typeof window !== 'undefined' && window.glasonlineProductSelector?.createTestOrderUrl) {
    return window.glasonlineProductSelector.createTestOrderUrl;
  }
  return '';
}

const isTestMode = computed(() => {
  return typeof window !== 'undefined' && !!window.glasonlineProductSelector?.testMode;
});

function maybeAutofillTestCustomer() {
  if (!isTestMode.value) return;
  if (!customerName.value) customerName.value = 'Testkund Testsson';
  if (!customerEmail.value) customerEmail.value = 'test@example.com';
  if (!customerPhone.value) customerPhone.value = '0701234567';
  if (!customerAddress1.value) customerAddress1.value = 'Testgatan 1';
  if (!customerPostcode.value) customerPostcode.value = '111 22';
  if (!customerCity.value) customerCity.value = 'Stockholm';
}

maybeAutofillTestCustomer();

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

function buildInternalTrackingData() {
  const sel = order.value?.selections ?? {};
  const coloredGlassType = sel?.coloredGlassType?.title;

  if (sel?.photochromicColorSelection?.internalColorId) {
    return {
      photochromicId: sel.photochromicColorSelection.internalColorId
    };
  }

  if (coloredGlassType === 'Helfärg' && sel?.fashionColorSelection?.internalColorId) {
    return {
      helfargModeId: sel.fashionColorSelection.internalColorId
    };
  }

  if (coloredGlassType === 'Helfärg' && sel?.darknessSelection?.internalColorId) {
    return {
      helfargId: sel.darknessSelection.internalColorId
    };
  }

  if (coloredGlassType === 'Gradal' && sel?.colorSelection?.internalColorId) {
    return {
      gradalId: sel.colorSelection.internalColorId
    };
  }

  if (coloredGlassType === 'Gradal' && sel?.gradientFashionSelection?.internalColorId) {
    return {
      gradalModeId: sel.gradientFashionSelection.internalColorId
    };
  }

  if (coloredGlassType === 'Polariserad' && sel?.colorSelection?.internalColorId) {
    return {
      polariseradId: sel.colorSelection.internalColorId
    };
  }

  return undefined;
}

/** Collect priceKey from each top-level selection object (shop lookup / pricing modifiers). */
function collectPriceKeysFromSelections(sel) {
  const out = {};
  if (!sel || typeof sel !== 'object') return out;
  for (const [stepId, val] of Object.entries(sel)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && val.priceKey) {
      out[stepId] = val.priceKey;
    }
  }
  return out;
}

/** Collect every internalColorId in the tree with dotted paths (for shop decoding). */
function collectInternalColorIdsByPath(obj, path = '') {
  const out = {};
  if (obj === null || obj === undefined) return out;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      Object.assign(out, collectInternalColorIdsByPath(item, path ? `${path}[${i}]` : `[${i}]`));
    });
    return out;
  }
  if (typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (k === 'internalColorId' && typeof v === 'string') {
      out[p] = v;
    } else if (v && typeof v === 'object') {
      Object.assign(out, collectInternalColorIdsByPath(v, p));
    }
  }
  return out;
}

/**
 * Single object for the physical store: price modifiers, color IDs, preferences, prescription snapshot.
 * Persists with the order (draft + WC meta) so the shop can map codes to products.
 */
function buildOrderTrackingPayload() {
  const sel = order.value?.selections ?? {};
  const semantic = buildInternalTrackingData();
  const prefs = sel.internalPreferences;
  return {
    version: 1,
    priceKeys: collectPriceKeysFromSelections(sel),
    internalColorIdsByPath: collectInternalColorIdsByPath(sel),
    semanticColorIds: semantic ?? null,
    internalPreferences:
      prefs && typeof prefs === 'object' && !Array.isArray(prefs) ? { ...prefs } : null,
    prescription: sel.prescription ?? null
  };
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
        order_payload_json: {
          lines: buildOrderPayloadFromSelections(),
          tracking: buildOrderTrackingPayload()
        },
        internal_tracking: buildInternalTrackingData(),
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
      },
      selections: order.value?.selections ?? {}
    };
    const endpoint = isTestMode.value ? getTestOrderEndpoint() : getCheckoutEndpoint();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    if (isTestMode.value) {
      alert(`Testorder skapad i WooCommerce (#${data?.order_id ?? 'okänd'})`);
      return;
    }

    const redirectUrl = data?.checkoutUrl ?? data?.url;
    if (!redirectUrl) throw new Error("No checkout URL in server response");
    sessionStorage.setItem('glasonline_checkout_order', JSON.stringify({
      selections: order.value?.selections ?? {},
      totalPrice: order.value?.totalPrice ?? 0,
      shipping: storeData?.defaults?.shipping ?? 0
    }));
    window.location.href = redirectUrl;
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

                <div v-if="helfargSummaryText">
                  <div>Helfärg: {{ helfargSummaryText }}</div>
                </div>
                <div v-else-if="gradalSummaryText">
                  <div>Gradal: {{ gradalSummaryText }}</div>
                </div>
                <div v-else-if="selections.colorSelection">
                  <div>Färg: {{ selections.colorSelection.title }}</div>
                </div>
                <div v-else-if="selections.fashionColorSelection">
                  <div>Färg: {{ selections.fashionColorSelection.title }}</div>
                </div>
                <div v-else-if="selections.gradientFashionSelection">
                  <div>Färg: {{ selections.gradientFashionSelection.title }}</div>
                </div>

                <div v-if="selections.usage">
                  <div>Hur ska du använda dina glasögon?: {{ selections.usage.title }}</div>
                </div>

                <div v-if="selections.glassType">
                  <div>Typ av glas: {{ selections.glassType.title }}</div>
                </div>

                <div v-if="selections.prescription">
                  <div>Recept: {{ selections.prescription.title }}{{ selections.prescription.fileName ? ` (${selections.prescription.fileName})` : '' }}</div>
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
            <p v-if="formTouched && Object.values(formErrors).some(Boolean)" class="mb-4 text-sm rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700" role="alert">
              Kontrollera uppgifterna nedan. Fälten med fel måste rättas innan du kan gå vidare till betalning.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Namn *</label>
                <input
                  v-model="customerName"
                  type="text"
                  :aria-invalid="!!formErrors.customerName"
                  :aria-describedby="formErrors.customerName ? 'err-customerName' : undefined"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  :class="{ 'border-red-500': formErrors.customerName }"
                  style="color: var(--color-text); background-color: var(--color-background);"
                  :style="formErrors.customerName ? {} : { borderColor: 'var(--color-border)' }"
                  placeholder="För- och efternamn"
                >
                <p v-if="formErrors.customerName" id="err-customerName" class="mt-1 text-sm text-red-600">{{ formErrors.customerName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">E-post *</label>
                <input
                  v-model="customerEmail"
                  type="email"
                  :aria-invalid="!!formErrors.customerEmail"
                  :aria-describedby="formErrors.customerEmail ? 'err-customerEmail' : undefined"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  :class="{ 'border-red-500': formErrors.customerEmail }"
                  style="color: var(--color-text); background-color: var(--color-background);"
                  :style="formErrors.customerEmail ? {} : { borderColor: 'var(--color-border)' }"
                  placeholder="namn@exempel.se"
                >
                <p v-if="formErrors.customerEmail" id="err-customerEmail" class="mt-1 text-sm text-red-600">{{ formErrors.customerEmail }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Telefon</label>
                <input
                  v-model="customerPhone"
                  type="tel"
                  :aria-invalid="!!formErrors.customerPhone"
                  :aria-describedby="formErrors.customerPhone ? 'err-customerPhone' : undefined"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  :class="{ 'border-red-500': formErrors.customerPhone }"
                  style="color: var(--color-text); background-color: var(--color-background);"
                  :style="formErrors.customerPhone ? {} : { borderColor: 'var(--color-border)' }"
                  placeholder="Mobilnummer"
                >
                <p v-if="formErrors.customerPhone" id="err-customerPhone" class="mt-1 text-sm text-red-600">{{ formErrors.customerPhone }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Adress *</label>
                <input
                  v-model="customerAddress1"
                  type="text"
                  :aria-invalid="!!formErrors.customerAddress1"
                  :aria-describedby="formErrors.customerAddress1 ? 'err-customerAddress1' : undefined"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  :class="{ 'border-red-500': formErrors.customerAddress1 }"
                  style="color: var(--color-text); background-color: var(--color-background);"
                  :style="formErrors.customerAddress1 ? {} : { borderColor: 'var(--color-border)' }"
                  placeholder="Gatuadress och nummer"
                >
                <p v-if="formErrors.customerAddress1" id="err-customerAddress1" class="mt-1 text-sm text-red-600">{{ formErrors.customerAddress1 }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Postnummer *</label>
                <input
                  v-model="customerPostcode"
                  type="text"
                  inputmode="numeric"
                  :aria-invalid="!!formErrors.customerPostcode"
                  :aria-describedby="formErrors.customerPostcode ? 'err-customerPostcode' : undefined"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  :class="{ 'border-red-500': formErrors.customerPostcode }"
                  style="color: var(--color-text); background-color: var(--color-background);"
                  :style="formErrors.customerPostcode ? {} : { borderColor: 'var(--color-border)' }"
                  placeholder="t.ex. 123 45"
                >
                <p v-if="formErrors.customerPostcode" id="err-customerPostcode" class="mt-1 text-sm text-red-600">{{ formErrors.customerPostcode }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text)">Ort *</label>
                <input
                  v-model="customerCity"
                  type="text"
                  :aria-invalid="!!formErrors.customerCity"
                  :aria-describedby="formErrors.customerCity ? 'err-customerCity' : undefined"
                  class="w-full rounded-lg border px-3 py-2 text-sm"
                  :class="{ 'border-red-500': formErrors.customerCity }"
                  style="color: var(--color-text); background-color: var(--color-background);"
                  :style="formErrors.customerCity ? {} : { borderColor: 'var(--color-border)' }"
                  placeholder="Stad/ort"
                >
                <p v-if="formErrors.customerCity" id="err-customerCity" class="mt-1 text-sm text-red-600">{{ formErrors.customerCity }}</p>
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