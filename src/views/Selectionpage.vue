<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Card from '@/components/Card.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';
import PrescriptionForm from '@/components/PrescriptionForm.vue';
import PrescriptionUpload from '@/components/PrescriptionUpload.vue';
import { useOrderStore } from '@/stores/orderStore';

// Props to make page dynamic
const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  currentStepIndex: Number,
  totalSteps: Number
})

const orderStore = useOrderStore();
const {
  order,
  priceModifiers,
  navigationHistory
} = storeToRefs(orderStore);
const { updateOrder, navigateTo } = orderStore;

const showPrescriptionManualForm = ref(false);
const showPrescriptionUpload = ref(false);

// Get the image source; append build-time query to bust cache after deploys
function getImageSrc(src) {
  if (!src) return '';
  const path = import.meta.env.BASE_URL + src.replace(/^\//, '');
  const v = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';
  return v ? `${path}?v=${v}` : path;
}

// Get the initial glass type selection
const initialGlassType = computed(() => order.value.selections?.glassType?.title || null);

// Max absolute sphere from prescription (for lens recommendation). Null if no manual prescription.
const maxSphereFromPrescription = computed(() => {
  const manual = order.value.selections?.prescription?.manual;
  if (!manual?.right?.sphere && !manual?.left?.sphere) return null;
  const right = Math.abs(parseFloat(manual?.right?.sphere) || 0);
  const left = Math.abs(parseFloat(manual?.left?.sphere) || 0);
  return Math.max(right, left);
});

// For lensRecommendation step: only show options the customer is eligible for (1.74 only when strength >= 6).
const lensRecommendationOptions = computed(() => {
  if (props.step?.id !== 'lensRecommendation' || !props.step.options) return [];
  const maxSphere = maxSphereFromPrescription.value;
  return props.step.options.filter((opt) => {
    const minShow = opt.minSphereToShow ?? 0;
    if (maxSphere === null) return minShow === 0;
    return maxSphere >= minShow;
  });
});

// Which option index (within visible options) is recommended based on sphere strength.
const recommendedLensIndex = computed(() => {
  const maxSphere = maxSphereFromPrescription.value;
  if (maxSphere === null) return null;
  const opts = lensRecommendationOptions.value;
  const idx = opts.findIndex(
    (opt) =>
      maxSphere >= (opt.recommendMinSphere ?? 0) && maxSphere < (opt.recommendMaxSphere ?? Infinity)
  );
  return idx >= 0 ? idx : null;
});

// Options to display: use filtered list for lensRecommendation, otherwise step.options
const displayOptions = computed(() => {
  if (props.step?.id === 'lensRecommendation') return lensRecommendationOptions.value;
  return props.step?.options ?? [];
});

function getNextStepAfterPrescription() {
  return 'lensBrand';
}

function getNextStepAfterLensBrand() {
  return 'lensRecommendation';
}

function getNextStepAfterLensRecommendation() {
  return 'treatment';
}

function getNextStepAfterTreatment() {
  return 'tintSelection';
}

// Function to get the proper title based on glass type
function getProperTitle(option) {
  // Don't modify titles on the first step
  if (props.step.id === 'glassType') {
    return option.title;
  }
  
  // For subsequent steps, modify titles based on glass type (progressive)
  if (initialGlassType.value === "Progressiva glas" && option.title.includes("Enkelslipade")) {
    return option.title.replace("Enkelslipade", "Progressiva");
  }
  
  // For Terminalglas
  if (initialGlassType.value === "Terminalglas" && option.title.includes("Enkelslipade")) {
    return option.title.replace("Enkelslipade", "Terminal");
  }
  
  return option.title;
}

const currency = 'SEK';

// Calculate the price for an option based on its priceKey
function getOptionPrice(option) {
  if (!option.priceKey) return undefined;
  return priceModifiers.value?.[option.priceKey] || 0;
}

function handleSelection(option, index) {
  // When selecting a glass type that requires prescription, clear any previous "Utan styrkor" prescription
  if (props.step.id === 'glassType' && option.nextStep === 'prescription') {
    updateOrder('prescription', null);
  }

  updateOrder(props.step.id, option);

  if (props.step.id === 'glassType' && option.skipsPrescription) {
    updateOrder('prescription', option);
    navigateTo(option.nextStep);
    return;
  }

  if (props.step.id === 'prescription') {
    if (option.skipsPrescription) {
      navigateTo(getNextStepAfterPrescription());
      return;
    }
    if (option.opensManualForm) {
      showPrescriptionManualForm.value = true;
      return;
    }
    if (option.opensUpload) {
      showPrescriptionUpload.value = true;
      return;
    }
    navigateTo(getNextStepAfterPrescription());
    return;
  }

  if (props.step.id === 'lensBrand') {
    navigateTo(getNextStepAfterLensBrand());
    return;
  }

  if (props.step.id === 'lensRecommendation') {
    navigateTo(getNextStepAfterLensRecommendation());
    return;
  }

  if (props.step.id === 'treatment') {
    navigateTo(getNextStepAfterTreatment());
    return;
  }

  if (option.nextStep) {
    navigateTo(option.nextStep);
  }
}

function onPrescriptionFormSubmit(payload) {
  updateOrder('prescription', payload);
  showPrescriptionManualForm.value = false;
  navigateTo(getNextStepAfterPrescription());
}

function onPrescriptionFormCancel() {
  showPrescriptionManualForm.value = false;
}

function onPrescriptionUploadSubmit(payload) {
  updateOrder('prescription', payload);
  showPrescriptionUpload.value = false;
  navigateTo(getNextStepAfterPrescription());
}

function onPrescriptionUploadCancel() {
  showPrescriptionUpload.value = false;
}

function goBack() {
  // When manual prescription form is open, back should close it and show prescription options
  if (props.step?.id === 'prescription' && showPrescriptionManualForm.value) {
    showPrescriptionManualForm.value = false;
    return;
  }
  if (props.step?.id === 'prescription' && showPrescriptionUpload.value) {
    showPrescriptionUpload.value = false;
    return;
  }
  // Get the last step from history
  if (navigationHistory.value && navigationHistory.value.length > 0) {
    const previousStepId = navigationHistory.value[navigationHistory.value.length - 1];
    navigateTo(previousStepId, true);
  } else {
    // If no history, go to first step
    navigateTo('glassType', true);
  }
}
</script>

<template>
  <div class="min-h-screen p-6 md:p-8">
    <div class="max-w-4xl mx-auto">
      <ProgressBar :current-step="currentStepIndex" :total-steps="totalSteps" />

      <div class="grid grid-cols-[1fr_auto_1fr] items-center mb-8 gap-4">
        <div class="flex justify-start">
          <button
            v-if="step && step.showBackButton"
            @click="goBack"
            class="text-sm font-medium transition hover:opacity-80"
            style="color: var(--color-primary)"
          >
            <span>← Tillbaka</span>
          </button>
        </div>
        <h1 class="text-center text-2xl md:text-3xl font-semibold whitespace-nowrap" style="color: var(--color-heading)">
          {{ step ? step.title : '' }}
        </h1>
        <div></div>
      </div>

      <!-- Prescription step: show manual form, upload, or card options -->
      <template v-if="step && step.id === 'prescription' && showPrescriptionManualForm">
        <PrescriptionForm
          @submit="onPrescriptionFormSubmit"
          @cancel="onPrescriptionFormCancel"
        />
      </template>
      <template v-else-if="step && step.id === 'prescription' && showPrescriptionUpload">
        <PrescriptionUpload
          @submit="onPrescriptionUploadSubmit"
          @cancel="onPrescriptionUploadCancel"
        />
      </template>
      <template v-else>
        <div class="grid gap-4 justify-center" style="grid-template-columns: repeat(auto-fit, minmax(280px, 280px));">
          <div
            v-for="(option, index) in displayOptions"
            :key="option.title"
            class="h-full"
          >
            <Card
              :title="getProperTitle(option)"
              :description="option.description"
              :imageSrc="getImageSrc(option.imageSrc)"
              :imageSrcDark="option.imageSrcDark ? getImageSrc(option.imageSrcDark) : undefined"
              :price="getOptionPrice(option)"
              :currency="currency"
              :recommended="step?.id === 'lensRecommendation' && recommendedLensIndex === index"
              @click="handleSelection(option, index)"
            />
          </div>
        </div>
      </template>

      <ShoppingCart :totalPrice="order.totalPrice" title="Dina glas" :currency="currency" />
    </div>
  </div>
</template>