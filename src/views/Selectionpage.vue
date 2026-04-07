<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Card from '@/components/Card.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';
import PrescriptionForm from '@/components/PrescriptionForm.vue';
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

const infoModalOpen = ref(false);
const infoModalTitle = ref('');
const infoModalText = ref('');

function openInfoModal(title, text) {
  infoModalTitle.value = title || 'Information';
  infoModalText.value = text || '';
  infoModalOpen.value = true;
}

function closeInfoModal() {
  infoModalOpen.value = false;
}

const infoModalLines = computed(() => {
  const text = infoModalText.value || '';
  return text.split('\n');
});

const INFO_BOLD_HEADINGS = new Set([
  'vad siffrorna betyder',
  'tjocklek och estetik',
  'vikt',
  'bågens storlek spelar roll',
  'plus vs minus',
  'rekommendation som känns "smart"',
  'smart rekommendation',
  'transparens om begränsningar',
  'begränsningar'
]);

function normalizeHeading(line) {
  return (line || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isInfoHeadingLine(line) {
  const trimmed = (line || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('-')) return false;
  return INFO_BOLD_HEADINGS.has(normalizeHeading(trimmed));
}

function splitHeadingPrefix(line) {
  const raw = (line || '').trim();
  if (!raw || raw.startsWith('-')) return null;

  const idx = raw.indexOf(':');
  if (idx <= 0) return null;

  const prefix = raw.slice(0, idx).trim();
  const rest = raw.slice(idx + 1).trim();

  if (!INFO_BOLD_HEADINGS.has(normalizeHeading(prefix))) return null;

  return { heading: prefix, rest };
}

function stripBullet(line) {
  return (line || '').replace(/^\s*-\s*/, '');
}

// Get the image source; append build-time query to bust cache after deploys
function getImageSrc(src) {
  if (!src) return '';
  const path = import.meta.env.BASE_URL + src.replace(/^\//, '');
  const v = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';
  return v ? `${path}?v=${v}` : path;
}

function getOptionImageSrc(option) {
  const selectedColorTitle = order.value.selections?.colorSelection?.title;
  const byColor = option?.imageSrcByColor;
  if (selectedColorTitle && byColor && byColor[selectedColorTitle]) {
    return byColor[selectedColorTitle];
  }
  return option?.imageSrc;
}

// Get the initial glass type selection
const initialGlassType = computed(() => order.value.selections?.glassType?.title || null);

// Distance usage: only sphere matters; ADD and reading power are not relevant
const isDistanceOrAllround = computed(
  () => {
    const t = order.value.selections?.usage?.title;
    return t === 'Avstånd';
  }
);

/** Reading-only usage: near PD deduction applies for läsglas */
const isReadingDistance = computed(
  () => order.value.selections?.usage?.title === 'Läsavstånd'
);

// Only progressive lenses require segment/fitting height (in mm)
const requiresHeight = computed(() => initialGlassType.value === 'Progressiva glas');

// Max absolute sphere from prescription (for lens recommendation). Null if no manual prescription.
const maxSphereFromPrescription = computed(() => {
  const manual = order.value.selections?.prescription?.manual;
  if (!manual?.right?.sphere && !manual?.left?.sphere) return null;
  const right = Math.abs(parseFloat(manual?.right?.sphere) || 0);
  const left = Math.abs(parseFloat(manual?.left?.sphere) || 0);
  return Math.max(right, left);
});

const wantsPolarizedInOwnBrandHighStrengthFlow = computed(() => {
  const pref = order.value.selections?.internalPreferences;
  return !!pref?.preferPolarizedForOwnBrandHighStrength;
});

const shouldRecommend16ForPolarized = computed(
  () => wantsPolarizedInOwnBrandHighStrengthFlow.value && isOwnBrand.value && isStrengthAbove4.value
);

// Which option index (within visible options) is recommended based on sphere strength.
const recommendedLensIndex = computed(() => {
  if (props.step?.id === 'lensRecommendation') {
    if (
      shouldRecommend16ForPolarized.value
    ) {
      const opts = props.step?.options ?? [];
      const idx = opts.findIndex((opt) => opt.title === 'Glas 1.6');
      return idx >= 0 ? idx : null;
    }
  }

  const maxSphere = maxSphereFromPrescription.value;
  if (maxSphere === null) return null;
  const opts = props.step?.options ?? [];
  const idx = opts.findIndex(
    (opt) =>
      maxSphere >= (opt.recommendMinSphere ?? 0) && maxSphere < (opt.recommendMaxSphere ?? Infinity)
  );
  return idx >= 0 ? idx : null;
});

function getRecommendedLabel(option) {
  if (props.step?.id === 'lensRecommendation' && shouldRecommend16ForPolarized.value) {
    if (option?.title === 'Glas 1.6') return 'Optikern rekommenderar detta glas för polariserat glas';
  }
  return undefined;
}

// Options to display: use filtered list for lensRecommendation, otherwise step.options.
// Hide "Utan styrkor" in prescription step when initial glass type is progressive.
const displayOptions = computed(() => {
  if (!props.step) return [];

  if (props.step.id === 'lensRecommendation') {
    return props.step.options ?? [];
  }

  let options = props.step.options ?? [];

  if (props.step.id === 'prescription' && initialGlassType.value === 'Progressiva glas') {
    options = options.filter((opt) => opt.title !== 'Utan styrkor');
  }

  return options;
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
  
  return option.title;
}

const currency = 'SEK';

const includedTreatmentSelection = {
  title: 'Fullständig behandling (ingår)',
  priceKey: 'treatment_standard'
};

const polarizedColorMetadata = {
  Brun: { darknessLabel: '78% mörkhet', internalId: 'PB' },
  Grå: { darknessLabel: '83% mörkhet', internalId: 'PG' },
  Grön: { darknessLabel: '85% mörkhet', internalId: 'PN' }
};

const hasBlueLightFilterSelected = computed(
  () => order.value.selections?.treatment?.priceKey === 'treatment_blue_light'
);

const isStrengthAbove4 = computed(() => {
  const maxSphere = maxSphereFromPrescription.value;
  if (maxSphere === null) return false;
  return maxSphere > 4;
});

const isOwnBrand = computed(() => order.value.selections?.lensBrand?.title === 'Våra egna glasmärken');

const isOwnBrandWithIndex167 = computed(() => {
  const brand = order.value.selections?.lensBrand?.title;
  const lens = order.value.selections?.lensRecommendation?.title;
  return brand === 'Våra egna glasmärken' && lens === 'Glas 1.67';
});

const isOwnBrand167PolarizedBlocked = computed(
  () => isOwnBrandWithIndex167.value && isStrengthAbove4.value
);

// Calculate the price for an option based on its priceKey (amounts live in products.json)
function getOptionPrice(option) {
  if (!option.priceKey) return undefined;
  return priceModifiers.value?.[option.priceKey] || 0;
}

/** Prefix for lens brand cards (“från” + amount from products.json via priceKey). */
function getOptionPricePrefix(option) {
  if (props.step?.id === 'lensBrand' && option.priceKey) return 'från';
  return undefined;
}

function getOptionPriceLabel(option) {
  if (props.step?.id !== 'treatment') return undefined;
  if (option.priceKey === 'treatment_standard') return 'Ingår';
  return undefined;
}

function getOptionDescription(option) {
  if (props.step?.id === 'colorSelection') {
    const coloredTypeTitle = order.value.selections?.coloredGlassType?.title;
    if (coloredTypeTitle === 'Polariserad') {
      return polarizedColorMetadata[option.title]?.darknessLabel || option.description;
    }
  }
  return option.description;
}

function isOptionDisabled(option) {
  if (props.step?.id === 'treatment' && option.priceKey === 'treatment_standard') return true;
  if (
    props.step?.id === 'tintSelection' &&
    hasBlueLightFilterSelected.value &&
    (option.title === 'Färgade glas' || option.title === 'Färgskiftande glas')
  ) {
    return true;
  }
  if (
    props.step?.id === 'coloredGlassType' &&
    option.title === 'Polariserad' &&
    isOwnBrand167PolarizedBlocked.value
  ) {
    return true;
  }
  // Polarised lenses cannot be combined with blue tint
  if (props.step?.id === 'colorSelection' && option.title === 'Blå') {
    const coloredType = order.value.selections?.coloredGlassType;
    if (coloredType?.priceKey === 'sunglass_polarized') return true;
  }
  return false;
}

function getOptionDisabledReason(option) {
  if (
    props.step?.id === 'tintSelection' &&
    hasBlueLightFilterSelected.value &&
    (option.title === 'Färgade glas' || option.title === 'Färgskiftande glas')
  ) {
    return 'Det går inte att kombinera blåljusfilter med färgade eller färgskiftande glas';
  }
  if (
    props.step?.id === 'coloredGlassType' &&
    option.title === 'Polariserad' &&
    isOwnBrand167PolarizedBlocked.value
  ) {
    return 'Polariserat finns inte för Glas 1.67 i våra egna glasmärken (välj 1.6 istället)';
  }
  if (props.step?.id === 'colorSelection' && option.title === 'Blå') {
    const coloredType = order.value.selections?.coloredGlassType;
    if (coloredType?.priceKey === 'sunglass_polarized') {
      return 'Går inte att kombinera med polariserade glas';
    }
  }
  return undefined;
}

function continueWithoutBlueLight() {
  updateOrder('treatment', includedTreatmentSelection);
  navigateTo(getNextStepAfterTreatment());
}

function changeLensToEnablePolarized() {
  updateOrder('internalPreferences', {
    ...(order.value.selections?.internalPreferences || {}),
    preferPolarizedForOwnBrandHighStrength: true
  });

  // Clear downstream selections so the user can re-pick lens index cleanly
  updateOrder('coloredGlassType', null);
  updateOrder('gradientTintSelection', null);
  updateOrder('solidTintSelection', null);
  updateOrder('colorSelection', null);
  updateOrder('darknessSelection', null);
  updateOrder('photochromicColorSelection', null);
  updateOrder('tintSelection', null);
  updateOrder('treatment', null);
  updateOrder('lensRecommendation', null);

  navigateTo('lensRecommendation');
}

function handleSelection(option, index) {
  // When selecting a glass type that requires prescription, clear any previous "Utan styrkor" prescription
  if (props.step.id === 'glassType' && option.nextStep === 'prescription') {
    updateOrder('prescription', null);
  }

  let selectionToSave = option;
  if (props.step.id === 'colorSelection') {
    const coloredTypeTitle = order.value.selections?.coloredGlassType?.title;
    if (coloredTypeTitle === 'Gradal') {
      const selectedGradient = order.value.selections?.gradientTintSelection;
      const internalColorId = option.title
        ? selectedGradient?.internalIdByColor?.[option.title]
        : undefined;
      if (internalColorId) {
        selectionToSave = {
          ...option,
          internalColorId
        };
      }
    }
    if (coloredTypeTitle === 'Heltoning') {
      const selectedSolidTint = order.value.selections?.solidTintSelection;
      const internalColorId = option.title
        ? selectedSolidTint?.internalIdByColor?.[option.title]
        : undefined;
      if (internalColorId) {
        selectionToSave = {
          ...option,
          internalColorId
        };
      }
    }
    if (coloredTypeTitle === 'Polariserad') {
      const internalColorId = polarizedColorMetadata[option.title]?.internalId;
      if (internalColorId) {
        selectionToSave = {
          ...option,
          internalColorId
        };
      }
    }
  }

  if (props.step.id === 'darknessSelection') {
    const selectedColorTitle = order.value.selections?.colorSelection?.title;
    const internalColorId = selectedColorTitle
      ? option.internalIdByColor?.[selectedColorTitle]
      : undefined;
    if (internalColorId) {
      selectionToSave = {
        ...option,
        internalColorId
      };
    }
  }

  updateOrder(props.step.id, selectionToSave);

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
    navigateTo(getNextStepAfterPrescription());
    return;
  }

  // After choosing usage for single vision / no-power glasses
  // - If the option skips prescription, go directly to lens brand
  // - Otherwise, go to prescription step instead of summary
  if (props.step.id === 'usage') {
    if (option.skipsPrescription) {
      updateOrder('prescription', option);
      navigateTo('lensBrand');
      return;
    }
    if (initialGlassType.value === 'Enkelslipade glas / glas utan styrka') {
      navigateTo('prescription');
      return;
    }
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
    if (option.priceKey === 'treatment_standard') {
      updateOrder('treatment', includedTreatmentSelection);
      return;
    }
    navigateTo(getNextStepAfterTreatment());
    return;
  }

  // Only "Helfärg" should ask for darkness after selecting a color
  if (props.step.id === 'colorSelection') {
    const coloredType = order.value.selections?.coloredGlassType;
    if (coloredType?.title === 'Helfärg') {
      navigateTo('darknessSelection');
      return;
    }
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

function goBack() {
  // When manual prescription form is open, back should close it and show prescription options
  if (props.step?.id === 'prescription' && showPrescriptionManualForm.value) {
    showPrescriptionManualForm.value = false;
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

      <!-- Info modal (used for "Läs mer") -->
      <div
        v-if="infoModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeInfoModal"></div>
        <div
          class="relative w-full max-w-lg rounded-2xl border p-6 shadow-xl"
          style="background: var(--color-card); border-color: var(--color-border)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="text-lg font-semibold" style="color: var(--color-heading)">{{ infoModalTitle }}</div>
            <button
              type="button"
              class="text-sm font-semibold transition hover:opacity-80"
              style="color: var(--color-primary)"
              @click="closeInfoModal"
              aria-label="Stäng"
            >
              Stäng
            </button>
          </div>
          <div class="mt-3 text-sm leading-relaxed" style="color: var(--color-text)">
            <template v-for="(line, idx) in infoModalLines" :key="idx">
              <div v-if="!line.trim()" class="h-3"></div>
              <div v-else-if="splitHeadingPrefix(line)" class="mt-2 first:mt-0">
                <span class="font-semibold">{{ splitHeadingPrefix(line).heading }}</span><span>: {{ splitHeadingPrefix(line).rest }}</span>
              </div>
              <div v-else-if="isInfoHeadingLine(line)" class="font-semibold mt-2 first:mt-0">
                {{ line.trim() }}
              </div>
              <div v-else-if="!line.trim().startsWith('-')" class="mt-1">
                {{ line.trim() }}
              </div>
              <div v-else class="pl-4">
                • {{ stripBullet(line).trim() }}
              </div>
            </template>
          </div>
        </div>
      </div>

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
          :is-distance-or-allround="isDistanceOrAllround"
          :is-reading-distance="isReadingDistance"
          :requires-height="requiresHeight"
          @submit="onPrescriptionFormSubmit"
          @cancel="onPrescriptionFormCancel"
        />
      </template>
      <template v-else-if="step && step.id === 'treatment'">
        <div class="mb-6 rounded-xl border p-4 md:p-5" style="border-color: rgba(0,0,0,0.08); background: rgba(0,0,0,0.02);">
          <div class="text-base font-semibold" style="color: var(--color-heading)">Fullständig behandling ingår</div>
          <div class="mt-1 text-sm" style="color: var(--color-text-muted, rgba(0,0,0,0.7))">
            Anti-reflex, repskydd och antistatisk behandling ingår i alla glas. Du kan lägga till blåljusfilter som tillval.
          </div>
          <div class="mt-2 text-sm font-medium" style="color: var(--color-text-muted, rgba(0,0,0,0.75))">
            Om du väljer blåljusfilter kan du inte välja färgade eller färgskiftande glas i nästa steg.
          </div>
        </div>

        <div class="grid gap-4 justify-center" style="grid-template-columns: repeat(auto-fit, minmax(280px, 280px));">
          <div
            v-for="(option, index) in displayOptions"
            :key="option.title"
            class="h-full"
          >
            <Card
              :title="getProperTitle(option)"
              :description="getOptionDescription(option)"
              :imageSrc="getImageSrc(getOptionImageSrc(option))"
              :imageSrcDark="option.imageSrcDark ? getImageSrc(option.imageSrcDark) : undefined"
              :badgeText="option.badgeText"
              :price="getOptionPrice(option)"
              :pricePrefix="getOptionPricePrefix(option)"
              :priceLabel="getOptionPriceLabel(option)"
              :currency="currency"
              :disabled="isOptionDisabled(option)"
              :disabledReason="getOptionDisabledReason(option)"
              :infoTitle="option.infoTitle || step?.infoTitle"
              :infoText="option.infoText || step?.infoText"
              @click="handleSelection(option, index)"
              @info="openInfoModal(option.infoTitle || step?.infoTitle, option.infoText || step?.infoText)"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-center">
          <button
            type="button"
            @click="continueWithoutBlueLight"
            class="px-5 py-3 rounded-xl text-sm font-semibold transition hover:opacity-90"
            style="background: var(--color-primary); color: white;"
          >
            Fortsätt utan blåljusfilter
          </button>
        </div>
      </template>
      <template v-else>
        <div
          v-if="step && step.id === 'coloredGlassType' && isOwnBrand167PolarizedBlocked"
          class="mb-6 rounded-xl border p-4 md:p-5"
          style="border-color: rgba(0,0,0,0.08); background: rgba(0,0,0,0.02);"
          role="note"
        >
          <div class="text-base font-semibold" style="color: var(--color-heading)">Polariserat är inte tillgängligt</div>
          <div class="mt-1 text-sm" style="color: var(--color-text-muted, rgba(0,0,0,0.7))">
            Vid styrkor över ±4 finns inte polariserat för Glas 1.67 i våra egna glasmärken. Välj Glas 1.6 om du vill ha polariserat.
          </div>
          <button
            type="button"
            class="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
            style="background: var(--color-primary); color: white;"
            @click="changeLensToEnablePolarized"
          >
            Ändra glastyp (1.6 / 1.67)
          </button>
        </div>

        <div class="grid gap-4 justify-center" style="grid-template-columns: repeat(auto-fit, minmax(280px, 280px));">
          <div
            v-for="(option, index) in displayOptions"
            :key="option.title"
            class="h-full"
          >
            <Card
              :title="getProperTitle(option)"
              :description="getOptionDescription(option)"
              :imageSrc="getImageSrc(getOptionImageSrc(option))"
              :imageSrcDark="option.imageSrcDark ? getImageSrc(option.imageSrcDark) : undefined"
              :badgeText="option.badgeText"
              :price="getOptionPrice(option)"
              :pricePrefix="getOptionPricePrefix(option)"
              :priceLabel="getOptionPriceLabel(option)"
              :currency="currency"
              :recommended="step?.id === 'lensRecommendation' && recommendedLensIndex === index"
              :recommendedLabel="getRecommendedLabel(option)"
              :disabled="isOptionDisabled(option)"
              :disabledReason="getOptionDisabledReason(option)"
              :infoTitle="option.infoTitle || step?.infoTitle"
              :infoText="option.infoText || step?.infoText"
              @click="handleSelection(option, index)"
              @info="openInfoModal(option.infoTitle || step?.infoTitle, option.infoText || step?.infoText)"
            />
          </div>
        </div>
      </template>

      <ShoppingCart :totalPrice="order.totalPrice" title="Dina glas" :currency="currency" />
    </div>
  </div>
</template>