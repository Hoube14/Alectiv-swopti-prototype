<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  description: String,
  imageSrc: String,
  /** When set with imageSrc, renders a light-to-dark crossfade animation (e.g. färgskiftande glas) */
  imageSrcDark: String,
  /** Optional badge shown on card (e.g. "Nyhet") */
  badgeText: String,
  price: Number,
  /** Shown before amount + currency (e.g. "från" → "från 995 SEK") */
  pricePrefix: String,
  priceLabel: String,
  currency: String,
  recommended: Boolean,
  /** Optional override when recommended is true */
  recommendedLabel: String,
  /** Optional "learn more" content shown in modal */
  infoTitle: String,
  infoText: String,
  disabled: Boolean,
  /** Shown when disabled is true, e.g. reason why option is not available */
  disabledReason: String
});

defineEmits(['click', 'info']);

/** Full primary-green treatment when this option is recommended (e.g. lens index step). */
const isRecommendedLook = computed(() => props.recommended && !props.disabled);

const cardSurfaceStyle = computed(() => {
  if (props.disabled) {
    return {
      backgroundColor: 'var(--color-background)',
      borderColor: 'rgba(0,0,0,0.14)',
    };
  }
  if (isRecommendedLook.value) {
    return {
      backgroundColor: 'var(--color-primary-soft)',
      borderColor: 'var(--color-primary)',
    };
  }
  return {
    backgroundColor: 'var(--color-card)',
    borderColor: 'var(--color-border)',
  };
});

const headingColor = computed(() => 'var(--color-heading)');
const bodyTextColor = computed(() => 'var(--color-text)');
const recommendedLineColor = computed(() =>
  isRecommendedLook.value ? 'var(--color-primary)' : 'var(--color-recommended)'
);
const priceBlockColor = computed(() => 'var(--color-heading)');
const learnMoreColor = computed(() => 'var(--color-primary)');
const badgeStyle = computed(() =>
  isRecommendedLook.value
    ? { background: 'rgba(93,123,108,0.18)', color: 'var(--color-heading)' }
    : { background: 'rgba(0,0,0,0.06)', color: 'var(--color-heading)' }
);

</script>

<template>
  <div
    @click="disabled ? undefined : $emit('click')"
    class="relative h-full rounded-2xl border p-6 flex flex-col items-center shadow-sm transition-all duration-200 ease-out"
    :class="[
      disabled ? 'cursor-not-allowed opacity-60 grayscale' : 'cursor-pointer hover:scale-[1.03] hover:shadow-md',
      isRecommendedLook && 'hover:brightness-[1.02] ring-2 ring-[color:var(--color-primary)]/20',
    ]"
    :style="cardSurfaceStyle"
  >
    <div
      v-if="badgeText"
      class="absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-semibold"
      :style="badgeStyle"
    >
      {{ badgeText }}
    </div>
    <!-- Only render image if imageSrc exists -->
    <div v-if="imageSrc" class="mb-4 flex-shrink-0 h-24 flex items-center justify-center relative w-full">
      <!-- Animated pair: light ↔ dark crossfade -->
      <template v-if="imageSrcDark">
        <div class="photochromic-clip" aria-hidden="true">
          <img :src="imageSrc" :alt="title" class="photochromic-img photochromic-light">
          <img
            :src="imageSrcDark"
            :alt="title"
            class="photochromic-img photochromic-dark"
            :class="props.imageSrcDark === props.imageSrc ? 'photochromic-dark--filter' : ''"
          >
        </div>
      </template>
      <img
        v-else
        :src="imageSrc"
        :alt="title"
        class="h-24 max-w-full object-contain rounded-xl"
      >
    </div>
    <h3 class="font-semibold text-lg mb-2 text-center flex-shrink-0" :style="{ color: headingColor }">{{ title }}</h3>
    <p v-if="recommended" class="text-xs font-bold mb-1 flex-shrink-0 text-center" :style="{ color: recommendedLineColor }">
      {{ recommendedLabel || 'Optikern rekommenderar detta glas för dina styrkor' }}
    </p>
    <p
      v-if="description"
      class="text-sm text-center flex-1 min-h-0 leading-relaxed"
      :style="{ color: bodyTextColor }"
    >
      {{ description }}
    </p>
    <button
      v-if="!disabled && infoText"
      type="button"
      class="mt-3 text-sm font-semibold underline underline-offset-4 opacity-90 transition hover:opacity-100"
      :style="{ color: learnMoreColor }"
      @click.stop="$emit('info')"
    >
      Läs mer
    </button>

    <!-- Display price label (e.g. included) or price if available -->
    <div v-if="priceLabel" class="mt-2 font-semibold flex-shrink-0" :style="{ color: priceBlockColor }">
      {{ priceLabel }}
    </div>
    <div v-else-if="price !== undefined" class="mt-2 font-semibold flex-shrink-0" :style="{ color: priceBlockColor }">
      {{ pricePrefix ? pricePrefix + ' ' : '' }}{{ price }} {{ currency }}
    </div>
    <p v-if="disabled && disabledReason" class="mt-2 text-xs text-center flex-shrink-0 opacity-80" style="color: var(--color-text)">
      {{ disabledReason }}
    </p>
  </div>
</template>

<style scoped>
@keyframes photochromic-light {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes photochromic-dark {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
.photochromic-light {
  animation: photochromic-light 4s ease-in-out infinite;
}
.photochromic-dark {
  animation: photochromic-dark 4s ease-in-out infinite;
}
.photochromic-clip {
  width: 96px;
  height: 96px;
  position: relative;
  overflow: hidden;
  border-radius: 9999px;
  /* Clip a bit tighter to avoid showing any outer halo */
  clip-path: circle(42% at 50% 50%);
  background: transparent;
}
.photochromic-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  inset: 0;
}
.photochromic-dark--filter {
  filter: brightness(0.45) saturate(0.9) contrast(1.1);
}
</style>