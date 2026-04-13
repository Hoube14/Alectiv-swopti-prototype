<script setup>
import { ref, computed, watch } from 'vue';
import PrescriptionUpload from '@/components/PrescriptionUpload.vue';

const props = defineProps({
  /** When true (Avstånd/Allround), ADD and reading power are hidden – only sphere is relevant. */
  isDistanceOrAllround: { type: Boolean, default: false },
  /** When true (Läsavstånd), PD is adjusted toward near PD for ordering (optician rule). */
  isReadingDistance: { type: Boolean, default: false },
  /** When true (Progressiva glas), segment/fitting height in mm is required. */
  requiresHeight: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel', 'mailLater']);

// Sphere: minus first, plus last (common prescription order). 0 ends up in the middle.
const sphereOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = -6; i <= 6; i += 0.25) {
    const v = i.toFixed(2);
    opts.push({ value: v, label: i >= 0 ? `+${v}` : v });
  }
  return opts;
})();

// Cylinder: 0 first so list opens at 0 (then -0.25 down to -2)
const cylinderOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  opts.push({ value: '0.00', label: '0.00' });
  for (let i = -0.25; i >= -2; i -= 0.25) {
    const v = i.toFixed(2);
    opts.push({ value: v, label: v });
  }
  return opts;
})();

const addOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 0.25; i <= 5.5; i += 0.25) {
    const v = i.toFixed(2);
    opts.push({ value: v, label: `+${v}` });
  }
  return opts;
})();

const heightMmOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 15; i <= 35; i += 1) opts.push({ value: String(i), label: `${i} mm` });
  return opts;
})();

// PD limits (mm); values must be whole or half millimeters (step 0.5)
const PD_PER_EYE_MIN = 25;
const PD_PER_EYE_MAX = 35;
const PD_BINOCULAR_MIN = 55;
const PD_BINOCULAR_MAX = 80;
const NEAR_PD_DEDUCTION_PER_EYE_MM = 2;
const NEAR_PD_DEDUCTION_BINOCULAR_MM = 4;

function roundPdHalfStepMm(n) {
  return Math.round(n * 2) / 2;
}

/** Strip unit, trim; first comma becomes decimal dot for parsing */
function normalizePdInput(raw) {
  if (raw == null) return '';
  let s = String(raw).trim().replace(/\s*mm\s*$/i, '').trim();
  const commaIdx = s.indexOf(',');
  if (commaIdx !== -1) {
    s = `${s.slice(0, commaIdx).replace(/\./g, '')}.${s.slice(commaIdx + 1).replace(/\./g, '')}`;
  }
  return s.trim();
}

function validatePdMmString(input, min, max) {
  const raw = String(input ?? '').trim();
  if (!raw) return { ok: false, message: '' };
  let s = normalizePdInput(raw);
  if (/[.,]$/.test(s)) {
    return { ok: false, message: 'Komplettera värdet (t.ex. 25 eller 25,5).' };
  }
  if (!/^\d+(\.\d+)?$/.test(s)) return { ok: false, message: 'Ogiltigt värde.' };
  const num = Number(s);
  if (!Number.isFinite(num)) return { ok: false, message: 'Ogiltigt värde.' };
  if (num < min || num > max) return { ok: false, message: `Värdet ska vara mellan ${min} och ${max} mm.` };
  const doubled = num * 2;
  if (Math.abs(doubled - Math.round(doubled)) > 1e-6) {
    return { ok: false, message: 'Ange hel eller halv millimeter (t.ex. 25 eller 25,5).' };
  }
  const value = Math.round(doubled) / 2;
  return { ok: true, value };
}

function formatPdForForm(value) {
  if (value % 1 === 0) return String(Math.round(value));
  return String(value).replace('.', ',');
}

function onBlurPdEye(which) {
  const r = validatePdMmString(form.value[which].pd, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  if (r.ok) form.value[which].pd = formatPdForForm(r.value);
}

function onBlurPdBinocular() {
  const r = validatePdMmString(form.value.pdBinocular, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
  if (r.ok) form.value.pdBinocular = formatPdForForm(r.value);
}

function pdForPayload(rawPerEye) {
  const r = validatePdMmString(rawPerEye, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  if (!r.ok) return normalizePdInput(rawPerEye);
  if (!props.isReadingDistance) return String(r.value);
  return String(roundPdHalfStepMm(r.value - NEAR_PD_DEDUCTION_PER_EYE_MM));
}

function pdBinocularForPayload(raw) {
  const r = validatePdMmString(raw, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
  if (!r.ok) return normalizePdInput(raw);
  if (!props.isReadingDistance) return String(r.value);
  return String(roundPdHalfStepMm(r.value - NEAR_PD_DEDUCTION_BINOCULAR_MM));
}

const nearPdPreview = computed(() => {
  if (!props.isReadingDistance) {
    return { right: null, left: null };
  }
  const rR = validatePdMmString(form.value.right.pd, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  const rL = validatePdMmString(form.value.left.pd, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  return {
    right: rR.ok ? formatPdForForm(roundPdHalfStepMm(rR.value - NEAR_PD_DEDUCTION_PER_EYE_MM)) : null,
    left: rL.ok ? formatPdForForm(roundPdHalfStepMm(rL.value - NEAR_PD_DEDUCTION_PER_EYE_MM)) : null
  };
});

const nearPdBinocularPreview = computed(() => {
  if (!props.isReadingDistance) return null;
  const r = validatePdMmString(form.value.pdBinocular, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
  if (!r.ok) return null;
  return formatPdForForm(roundPdHalfStepMm(r.value - NEAR_PD_DEDUCTION_BINOCULAR_MM));
});

const form = ref({
  right: { sphere: '0.00', cylinder: '0.00', axis: '', add: '', heightMm: '', pd: '' },
  left: { sphere: '0.00', cylinder: '0.00', axis: '', add: '', heightMm: '', pd: '' },
  samePd: false,
  pdBinocular: '',
  /** User has followed the height measuring instructions (required if they opened the guide) */
  heightInstructionsConfirmed: false,
  attestation: false
});

const touched = ref({
  right: false,
  left: false,
  attestation: false
});

const errors = ref({
  right: { axis: '', add: '', heightMm: '', pd: '' },
  left: { axis: '', add: '', heightMm: '', pd: '' },
  pdBinocular: '',
  heightInstructionsConfirmed: '',
  attestation: ''
});

const rightModalOpen = ref(false);
const leftModalOpen = ref(false);
const uploadModalOpen = ref(false);
const binocularPdModalOpen = ref(false);

// Height guide: once opened, user must confirm they followed instructions to submit
const showHeightGuide = ref(false);
const hasOpenedHeightGuide = ref(false);

function openHeightGuide() {
  showHeightGuide.value = true;
  hasOpenedHeightGuide.value = true;
}

function openBinocularPdModal() {
  binocularPdModalOpen.value = true;
}

function closeBinocularPdModal() {
  binocularPdModalOpen.value = false;
}

function enableSamePd() {
  if (form.value.samePd) {
    openBinocularPdModal();
    return;
  }
  form.value.samePd = true;
  openBinocularPdModal();
}

function disableSamePd() {
  form.value.samePd = false;
  form.value.pdBinocular = '';
  errors.value = { ...errors.value, pdBinocular: '' };
  binocularPdModalOpen.value = false;
}

function validateEye(which) {
  const eye = form.value[which];
  const err = { axis: '', add: '', heightMm: '', pd: '' };

  if (eye.cylinder && eye.cylinder !== '0.00' && !eye.axis) {
    err.axis = which === 'right' ? 'Fyll i axel för höger öga' : 'Fyll i axel för vänster öga';
  }

  const requiresAdd = props.isReadingDistance || props.requiresHeight;
  if (requiresAdd && !props.isDistanceOrAllround && !eye.add) {
    err.add = which === 'right' ? 'Välj ADD för höger öga' : 'Välj ADD för vänster öga';
  }

  if (props.requiresHeight && !eye.heightMm) {
    err.heightMm =
      which === 'right'
        ? 'Välj monteringshöjd för höger öga (mm)'
        : 'Välj monteringshöjd för vänster öga (mm)';
  }

  // PD validation:
  // - If samePd, PD is validated in the binocular field (outside per-eye)
  // - Otherwise, each eye must have its PD
  if (!form.value.samePd) {
    if (!eye.pd?.trim()) {
      err.pd = which === 'right' ? 'Fyll i PD för höger öga' : 'Fyll i PD för vänster öga';
    } else {
      const r = validatePdMmString(eye.pd, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
      if (!r.ok) err.pd = r.message || 'Ogiltigt PD-värde';
    }
  }

  errors.value = { ...errors.value, [which]: err };
  return !Object.values(err).some(Boolean);
}

function validateAll() {
  const okRight = validateEye('right');
  const okLeft = validateEye('left');
  let pdBinErr = '';
  if (form.value.samePd) {
    if (!form.value.pdBinocular?.trim()) {
      pdBinErr = 'Fyll i PD (Bin)';
    } else {
      const r = validatePdMmString(form.value.pdBinocular, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
      if (!r.ok) pdBinErr = r.message || 'Ogiltigt PD-värde';
    }
  }
  let heightConfirmErr = '';
  if (props.requiresHeight && !form.value.heightInstructionsConfirmed) {
    heightConfirmErr = 'Bekräfta att du har följt instruktionerna';
  }
  let att = '';
  if (!form.value.attestation) att = 'Du måste intyga att du skrivit in rätt styrkor';
  errors.value = {
    ...errors.value,
    pdBinocular: pdBinErr,
    heightInstructionsConfirmed: heightConfirmErr,
    attestation: att
  };
  return okRight && okLeft && !pdBinErr && !heightConfirmErr && !att;
}

function parsePrescriptionNumber(value) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getSphereCylinderCombinedStrength(eye) {
  const s = Math.abs(parsePrescriptionNumber(eye?.sphere));
  const c = Math.abs(parsePrescriptionNumber(eye?.cylinder));
  return s + c;
}

const exceedsSphereCylinderLimit = computed(() => {
  return [form.value.right, form.value.left].some((eye) => getSphereCylinderCombinedStrength(eye) > 6);
});

const showStrengthLimitModal = ref(false);
watch(exceedsSphereCylinderLimit, (shouldShow) => {
  showStrengthLimitModal.value = !!shouldShow;
  if (shouldShow) {
    // Ensure the user actually sees the limit modal even if an eye modal is open.
    rightModalOpen.value = false;
    leftModalOpen.value = false;
    binocularPdModalOpen.value = false;
  }
});

const eyeHasBlockingErrors = computed(() => {
  return {
    right: Object.values(errors.value.right).some(Boolean),
    left: Object.values(errors.value.left).some(Boolean)
  };
});

const isEyeComplete = computed(() => {
  const requiresAdd = props.isReadingDistance || props.requiresHeight;
  const right = form.value.right;
  const left = form.value.left;
  const axisOk = (eye) => !eye.cylinder || eye.cylinder === '0.00' || !!eye.axis;
  const addOk = (eye) => props.isDistanceOrAllround || !requiresAdd || !!eye.add;
  const heightOk = (eye) => !props.requiresHeight || !!eye.heightMm;
  const heightGuideOk = () => !props.requiresHeight || !!form.value.heightInstructionsConfirmed;
  const pdOk = (eye) =>
    form.value.samePd || validatePdMmString(eye.pd, PD_PER_EYE_MIN, PD_PER_EYE_MAX).ok;

  return {
    right: axisOk(right) && addOk(right) && heightOk(right) && heightGuideOk() && pdOk(right),
    left: axisOk(left) && addOk(left) && heightOk(left) && heightGuideOk() && pdOk(left)
  };
});

const showHeightConfirmError = computed(() => {
  if (!props.requiresHeight) return false;
  const anyHeightSelected = !!form.value.right.heightMm || !!form.value.left.heightMm;
  return !!errors.value.heightInstructionsConfirmed || (anyHeightSelected && !form.value.heightInstructionsConfirmed);
});

function openEye(which) {
  touched.value[which] = true;
  if (which === 'right') rightModalOpen.value = true;
  else leftModalOpen.value = true;
}

function closeEye(which) {
  validateEye(which);
  if (which === 'right') rightModalOpen.value = false;
  else leftModalOpen.value = false;
}

function submitManual() {
  touched.value.right = true;
  touched.value.left = true;
  touched.value.attestation = true;

  if (!validateAll()) return;
  if (exceedsSphereCylinderLimit.value) {
    showStrengthLimitModal.value = true;
    return;
  }

  const right = { sphere: form.value.right.sphere, cylinder: form.value.right.cylinder, axis: form.value.right.axis };
  const left = { sphere: form.value.left.sphere, cylinder: form.value.left.cylinder, axis: form.value.left.axis };
  if (!props.isDistanceOrAllround) {
    right.add = form.value.right.add;
    left.add = form.value.left.add;
  }

  const manual = {
    right,
    left,
    pd: form.value.samePd
      ? pdBinocularForPayload(form.value.pdBinocular)
      : {
          right: pdForPayload(form.value.right.pd),
          left: pdForPayload(form.value.left.pd)
        },
    receiptNotOlderThanOneYear: true
  };

  if (props.requiresHeight) {
    manual.heightMm = { right: form.value.right.heightMm, left: form.value.left.heightMm };
  }

  emit('submit', { title: 'Manuellt', type: 'manual', manual });
}

function onUploadSubmit(payload) {
  uploadModalOpen.value = false;
  emit('submit', payload);
}
</script>

<template>
  <div class="space-y-4">
    <!-- Combined card: H + V as two cards in one card -->
    <div class="rounded-2xl border p-5 shadow-sm" style="background: var(--color-card); border-color: var(--color-border)">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-lg font-semibold" style="color: var(--color-heading)">Fyll i dina styrkor</div>
          <div class="mt-1 text-sm" style="color: var(--color-text)">
            Tryck på Höger eller Vänster och fyll i värdena från ditt recept.
          </div>
        </div>
        <button
          type="button"
          class="text-sm font-semibold transition hover:opacity-80"
          style="color: var(--color-primary)"
          @click="emit('mailLater')"
        >
          Maila in senare
        </button>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="group relative rounded-xl border p-4 text-left transition"
          :class="[
            (touched.right && !isEyeComplete.right) || (touched.right && eyeHasBlockingErrors.right)
              ? 'border-red-500 bg-red-50'
              : 'hover:shadow-sm'
          ]"
          style="border-color: var(--color-border); background: var(--color-background)"
          @click="openEye('right')"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-base font-bold"
              :class="(touched.right && !isEyeComplete.right) ? 'border-red-300 text-red-700' : 'border-gray-200 text-gray-800'"
            >
              H
            </div>
            <div class="min-w-0">
              <div class="font-semibold" style="color: var(--color-heading)">Höger öga</div>
              <div
                class="text-xs"
                :class="[
                  isEyeComplete.right ? 'text-green-700 font-medium' : '',
                  touched.right && !isEyeComplete.right ? 'text-red-700 font-medium' : '',
                  !isEyeComplete.right && !touched.right ? 'text-gray-600' : ''
                ]"
              >
                {{ isEyeComplete.right ? 'Klart' : 'Saknar värden' }}
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          class="group relative rounded-xl border p-4 text-left transition"
          :class="[
            (touched.left && !isEyeComplete.left) || (touched.left && eyeHasBlockingErrors.left)
              ? 'border-red-500 bg-red-50'
              : 'hover:shadow-sm'
          ]"
          style="border-color: var(--color-border); background: var(--color-background)"
          @click="openEye('left')"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-base font-bold"
              :class="(touched.left && !isEyeComplete.left) ? 'border-red-300 text-red-700' : 'border-gray-200 text-gray-800'"
            >
              V
            </div>
            <div class="min-w-0">
              <div class="font-semibold" style="color: var(--color-heading)">Vänster öga</div>
              <div
                class="text-xs"
                :class="[
                  isEyeComplete.left ? 'text-green-700 font-medium' : '',
                  touched.left && !isEyeComplete.left ? 'text-red-700 font-medium' : '',
                  !isEyeComplete.left && !touched.left ? 'text-gray-600' : ''
                ]"
              >
                {{ isEyeComplete.left ? 'Klart' : 'Saknar värden' }}
              </div>
            </div>
          </div>
        </button>
      </div>

      <div class="mt-4 flex items-start gap-3 rounded-xl border p-4" style="border-color: rgba(0,0,0,0.10); background: rgba(0,0,0,0.02);">
        <input
          id="attestation"
          v-model="form.attestation"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-gray-300"
          @change="touched.attestation = true"
        />
        <div class="min-w-0">
          <label for="attestation" class="text-sm font-medium" style="color: var(--color-heading)">
            Jag intygar att jag skrivit in rätt styrkor
          </label>
          <p v-if="touched.attestation && errors.attestation" class="mt-1 text-sm text-red-600">
            {{ errors.attestation }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style="background: var(--color-primary); color: white;"
          @click="submitManual"
        >
          Fortsätt
        </button>
        <button
          type="button"
          class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
          style="border-color: var(--color-border); color: var(--color-primary); background: var(--color-card)"
          @click="emit('cancel')"
        >
          Avbryt
        </button>
      </div>
    </div>

    <!-- Upload card -->
    <div
      class="rounded-2xl border p-5 shadow-sm transition hover:shadow-md cursor-pointer"
      style="background: var(--color-card); border-color: var(--color-border)"
      role="button"
      tabindex="0"
      @click="uploadModalOpen = true"
      @keydown.enter.prevent="uploadModalOpen = true"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-lg font-semibold" style="color: var(--color-heading)">Bifoga recept</div>
          <div class="mt-1 text-sm" style="color: var(--color-text)">Ladda upp en bild eller PDF så kan vi dubbelkolla dina styrkor.</div>
        </div>
        <div class="text-sm font-semibold" style="color: var(--color-primary)">Öppna →</div>
      </div>
    </div>

    <!-- Eye modal: Right -->
    <div v-if="rightModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-black/50" @click="closeEye('right')"></div>
      <div class="relative w-full max-w-xl rounded-2xl border p-5 shadow-xl" style="background: var(--color-card); border-color: var(--color-border)">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-lg font-semibold" style="color: var(--color-heading)">Höger öga (H)</div>
            <div class="mt-1 text-sm" style="color: var(--color-text)">Fyll i värdena från ditt recept.</div>
          </div>
          <button type="button" class="text-sm font-semibold transition hover:opacity-80" style="color: var(--color-primary)" @click="closeEye('right')">
            Stäng
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Sfär (SF)</label>
            <select v-model="form.right.sphere" class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900">
              <option v-for="opt in sphereOptions" :key="`rs-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Cylinder (CYL)</label>
            <select v-model="form.right.cylinder" class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900">
              <option v-for="opt in cylinderOptions" :key="`rc-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
            <button
              type="button"
              class="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 opacity-90 transition hover:opacity-100"
              @click="showStrengthLimitModal = true"
            >
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-600"
                aria-hidden="true"
              >
                i
              </span>
              Jag kan inte se mina styrkor
            </button>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Axel</label>
            <input
              v-model="form.right.axis"
              type="text"
              placeholder="1–180"
              maxlength="3"
              class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
              :disabled="!form.right.cylinder || form.right.cylinder === '0.00'"
              :class="{ 'border-red-500': touched.right && errors.right.axis }"
            />
            <p v-if="touched.right && errors.right.axis" class="mt-1 text-sm text-red-600">{{ errors.right.axis }}</p>
          </div>

          <div v-if="!isDistanceOrAllround">
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Addition (ADD)
              <span v-if="isReadingDistance || requiresHeight" class="text-gray-900" aria-hidden="true">*</span>
            </label>
            <select
              v-model="form.right.add"
              class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              :class="{ 'border-red-500': touched.right && errors.right.add }"
            >
              <option v-for="opt in addOptions" :key="`ra-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p v-if="touched.right && errors.right.add" class="mt-1 text-sm text-red-600">{{ errors.right.add }}</p>
          </div>

          <div v-if="requiresHeight">
            <label class="mb-1 block text-sm font-medium text-gray-700">Monteringshöjd (mm) *</label>
            <select
              v-model="form.right.heightMm"
              class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              :class="{ 'border-red-500': touched.right && errors.right.heightMm }"
            >
              <option v-for="opt in heightMmOptions" :key="`rh-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p v-if="touched.right && errors.right.heightMm" class="mt-1 text-sm text-red-600">{{ errors.right.heightMm }}</p>
            <button
              type="button"
              class="mt-3 inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition hover:bg-gray-100"
              :class="showHeightConfirmError ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'"
              @click="openHeightGuide"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-500">?</span>
              <span>Hur mäter jag höjd?</span>
            </button>
            <div class="mt-3 flex items-start gap-3 rounded border bg-white p-3" :class="showHeightConfirmError ? 'border-red-300' : 'border-gray-200'">
              <input
                id="height-instructions-confirmed-right"
                v-model="form.heightInstructionsConfirmed"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <label for="height-instructions-confirmed-right" class="text-sm text-gray-700">
                Jag har följt instruktionerna och mätt höjden.
              </label>
            </div>
            <p v-if="showHeightConfirmError" class="mt-2 text-sm text-red-600">
              {{ errors.heightInstructionsConfirmed || 'Bekräfta att du har följt instruktionerna' }}
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Pupillavstånd (PD) *</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.right.pd"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                class="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                :class="{ 'border-red-500': touched.right && errors.right.pd }"
                :disabled="form.samePd"
                @blur="onBlurPdEye('right')"
              />
              <span class="shrink-0 text-sm text-gray-500">mm</span>
            </div>
            <p v-if="touched.right && errors.right.pd" class="mt-1 text-sm text-red-600">{{ errors.right.pd }}</p>
            <div v-if="isReadingDistance && !form.samePd" class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p class="text-xs font-medium text-gray-700">När‑PD (beräknad)</p>
              <p class="mt-1 text-sm text-gray-900">
                {{ nearPdPreview.right != null ? `${nearPdPreview.right} mm` : '—' }}
              </p>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <input
                id="same-pd-right"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300"
                :checked="form.samePd"
                @change="($event) => ($event.target.checked ? enableSamePd() : disableSamePd())"
              />
              <label for="same-pd-right" class="text-sm text-gray-700">Jag har sammanslaget PD (Bin)</label>
            </div>
            <div v-if="form.samePd" class="mt-2 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div class="min-w-0">
                <div class="text-xs text-gray-500">PD (Bin)</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ form.pdBinocular?.trim() ? `${form.pdBinocular} mm` : 'Inte angivet' }}
                </div>
              </div>
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                @click="openBinocularPdModal"
              >
                Ange
              </button>
            </div>
            <p v-if="form.samePd && errors.pdBinocular" class="mt-2 text-sm text-red-600">{{ errors.pdBinocular }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Eye modal: Left -->
    <div v-if="leftModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-black/50" @click="closeEye('left')"></div>
      <div class="relative w-full max-w-xl rounded-2xl border p-5 shadow-xl" style="background: var(--color-card); border-color: var(--color-border)">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-lg font-semibold" style="color: var(--color-heading)">Vänster öga (V)</div>
            <div class="mt-1 text-sm" style="color: var(--color-text)">Fyll i värdena från ditt recept.</div>
          </div>
          <button type="button" class="text-sm font-semibold transition hover:opacity-80" style="color: var(--color-primary)" @click="closeEye('left')">
            Stäng
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Sfär (SF)</label>
            <select v-model="form.left.sphere" class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900">
              <option v-for="opt in sphereOptions" :key="`ls-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Cylinder (CYL)</label>
            <select v-model="form.left.cylinder" class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900">
              <option v-for="opt in cylinderOptions" :key="`lc-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
            <button
              type="button"
              class="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 opacity-90 transition hover:opacity-100"
              @click="showStrengthLimitModal = true"
            >
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-600"
                aria-hidden="true"
              >
                i
              </span>
              Jag kan inte se mina styrkor
            </button>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Axel</label>
            <input
              v-model="form.left.axis"
              type="text"
              placeholder="1–180"
              maxlength="3"
              class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
              :disabled="!form.left.cylinder || form.left.cylinder === '0.00'"
              :class="{ 'border-red-500': touched.left && errors.left.axis }"
            />
            <p v-if="touched.left && errors.left.axis" class="mt-1 text-sm text-red-600">{{ errors.left.axis }}</p>
          </div>

          <div v-if="!isDistanceOrAllround">
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Addition (ADD)
              <span v-if="isReadingDistance || requiresHeight" class="text-gray-900" aria-hidden="true">*</span>
            </label>
            <select
              v-model="form.left.add"
              class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              :class="{ 'border-red-500': touched.left && errors.left.add }"
            >
              <option v-for="opt in addOptions" :key="`la-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p v-if="touched.left && errors.left.add" class="mt-1 text-sm text-red-600">{{ errors.left.add }}</p>
          </div>

          <div v-if="requiresHeight">
            <label class="mb-1 block text-sm font-medium text-gray-700">Monteringshöjd (mm) *</label>
            <select
              v-model="form.left.heightMm"
              class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              :class="{ 'border-red-500': touched.left && errors.left.heightMm }"
            >
              <option v-for="opt in heightMmOptions" :key="`lh-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p v-if="touched.left && errors.left.heightMm" class="mt-1 text-sm text-red-600">{{ errors.left.heightMm }}</p>
            <button
              type="button"
              class="mt-3 inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition hover:bg-gray-100"
              :class="showHeightConfirmError ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'"
              @click="openHeightGuide"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-500">?</span>
              <span>Hur mäter jag höjd?</span>
            </button>
            <div class="mt-3 flex items-start gap-3 rounded border bg-white p-3" :class="showHeightConfirmError ? 'border-red-300' : 'border-gray-200'">
              <input
                id="height-instructions-confirmed-left"
                v-model="form.heightInstructionsConfirmed"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <label for="height-instructions-confirmed-left" class="text-sm text-gray-700">
                Jag har följt instruktionerna och mätt höjden.
              </label>
            </div>
            <p v-if="showHeightConfirmError" class="mt-2 text-sm text-red-600">
              {{ errors.heightInstructionsConfirmed || 'Bekräfta att du har följt instruktionerna' }}
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Pupillavstånd (PD) *</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.left.pd"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                class="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                :class="{ 'border-red-500': touched.left && errors.left.pd }"
                :disabled="form.samePd"
                @blur="onBlurPdEye('left')"
              />
              <span class="shrink-0 text-sm text-gray-500">mm</span>
            </div>
            <p v-if="touched.left && errors.left.pd" class="mt-1 text-sm text-red-600">{{ errors.left.pd }}</p>
            <div v-if="isReadingDistance && !form.samePd" class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p class="text-xs font-medium text-gray-700">När‑PD (beräknad)</p>
              <p class="mt-1 text-sm text-gray-900">
                {{ nearPdPreview.left != null ? `${nearPdPreview.left} mm` : '—' }}
              </p>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <input
                id="same-pd-left"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300"
                :checked="form.samePd"
                @change="($event) => ($event.target.checked ? enableSamePd() : disableSamePd())"
              />
              <label for="same-pd-left" class="text-sm text-gray-700">Jag har sammanslaget PD (Bin)</label>
            </div>
            <div v-if="form.samePd" class="mt-2 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div class="min-w-0">
                <div class="text-xs text-gray-500">PD (Bin)</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ form.pdBinocular?.trim() ? `${form.pdBinocular} mm` : 'Inte angivet' }}
                </div>
              </div>
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                @click="openBinocularPdModal"
              >
                Ange
              </button>
            </div>
            <p v-if="form.samePd && errors.pdBinocular" class="mt-2 text-sm text-red-600">{{ errors.pdBinocular }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload modal -->
    <div v-if="uploadModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-black/50" @click="uploadModalOpen = false"></div>
      <div class="relative w-full max-w-2xl">
        <PrescriptionUpload @submit="onUploadSubmit" @cancel="uploadModalOpen = false" />
      </div>
    </div>

    <!-- Binocular PD modal -->
    <div
      v-if="binocularPdModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeBinocularPdModal"></div>
      <div class="relative w-full max-w-lg rounded-2xl border p-5 shadow-xl" style="background: var(--color-card); border-color: var(--color-border)">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-lg font-semibold" style="color: var(--color-heading)">Sammanslaget PD (Bin)</div>
            <div class="mt-1 text-sm" style="color: var(--color-text)">Ange ditt totala PD-värde i mm.</div>
          </div>
          <button type="button" class="text-sm font-semibold transition hover:opacity-80" style="color: var(--color-primary)" @click="closeBinocularPdModal">
            Stäng
          </button>
        </div>

        <div class="mt-4 max-w-xs">
          <label class="mb-1 block text-sm font-medium text-gray-700">PD (Bin)</label>
          <div class="flex items-center gap-2">
            <input
              v-model="form.pdBinocular"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900"
              :class="{ 'border-red-500': !!errors.pdBinocular }"
              @blur="onBlurPdBinocular"
            />
            <span class="shrink-0 text-sm text-gray-500">mm</span>
          </div>
          <p v-if="errors.pdBinocular" class="mt-1 text-sm text-red-600">{{ errors.pdBinocular }}</p>
        </div>

        <div v-if="isReadingDistance" class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p class="text-xs font-medium text-gray-700">När‑PD (beräknad)</p>
          <p class="mt-1 text-sm text-gray-900">
            {{ nearPdBinocularPreview != null ? `${nearPdBinocularPreview} mm` : '—' }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Vi räknar om PD till när‑PD i ordern när du väljer läsavstånd.
          </p>
        </div>

        <div class="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style="border-color: var(--color-border); color: var(--color-primary); background: var(--color-card)"
            @click="
              disableSamePd();
            "
          >
            Använd per öga istället
          </button>
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
            style="background: var(--color-primary); color: white;"
            @click="closeBinocularPdModal"
          >
            Spara
          </button>
        </div>
      </div>
    </div>

    <!-- Height guide modal -->
    <div
      v-if="showHeightGuide"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/50" @click="showHeightGuide = false"></div>
      <div
        class="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5 shadow-xl"
        style="background: var(--color-card); border-color: var(--color-border)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-lg font-semibold" style="color: var(--color-heading)">
              Mätning av ögonens ”höjd” i glasögonbågen
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 text-sm font-semibold transition hover:opacity-80"
            style="color: var(--color-primary)"
            @click="showHeightGuide = false"
          >
            Stäng
          </button>
        </div>

        <div class="mt-4 space-y-3 text-sm text-gray-700">
          <p>
            För att glasen skall centreras rätt i bågen och glasögonen därmed skall fungera så bra som
            möjligt, måste måtten från glasets underkant till pupillens mitt anges, separat för höger respektive vänster
            öga om de skiljer sig åt.
          </p>
          <p>
            Dessa mått används sedan när glasögonen tillverkas för att glasen skall centreras optimalt för dig.
          </p>
          <p>
            Det är därför viktigt att bågen sitter bekvämt och som du vill ha den samt att du står med normal
            kropps- och huvudhållning när mätningen av höjden görs.
          </p>
          <p class="font-medium">Följande beskrivning är ett bra sätt att mäta höjden på:</p>
        </div>

        <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
          <li>Sätt på dig bågen så att den sitter bra</li>
          <li>Ställ dig upp och titta på någon punkt minst 10 meter bort (gärna längre bort).</li>
          <li>
            Be någon att hjälpa dig att sätta ut markeringar i höjd med mitten av pupillen på glasen som sitter i bågen
            (se bild) genom att stå på samma höjd som dina ögon.
            <img
              src="/images/Markerapupill.png"
              alt="Illustration: markera pupillens mitt på glaset i bågen"
              class="mt-3 w-full rounded-lg border border-gray-200 bg-white object-contain"
              loading="lazy"
            />
          </li>
          <li>
            Ta av och på glasögonen några gånger för att personen skall kunna kontrollera att markeringarna har hamnat i
            höjd med mitten av pupillen, annars justera markeringarna.
          </li>
          <li>
            När det är klart, ta en linjal och mät avståndet från glasets underkant till markeringarna (se bild) för pupillens mitt
            för höger och vänster öga sen ange måtten i beställningen.
            <img
              src="/images/Underkanthojd.png"
              alt="Illustration: mät från glasets underkant till markeringen"
              class="mt-3 w-full rounded-lg border border-gray-200 bg-white object-contain"
              loading="lazy"
            />
          </li>
        </ol>

        <div class="mt-4">
          <div
            class="flex items-start gap-3 rounded border bg-white p-3"
            :class="showHeightConfirmError ? 'border-red-300' : 'border-gray-200'"
          >
            <input
              id="height-instructions-confirmed"
              v-model="form.heightInstructionsConfirmed"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300"
              @change="(e) => (e.target.checked ? (showHeightGuide = false) : null)"
            />
            <div class="min-w-0">
              <label for="height-instructions-confirmed" class="text-sm text-gray-700">
                Jag har följt instruktionerna och mätt höjden.
              </label>
              <p v-if="showHeightConfirmError" class="mt-1 text-sm text-red-600">
                {{ errors.heightInstructionsConfirmed || 'Bekräfta att du har följt instruktionerna' }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
            style="background: var(--color-primary); color: white;"
            @click="showHeightGuide = false"
          >
            Klar
          </button>
        </div>
      </div>
    </div>

    <!-- Strength limit modal -->
    <div
      v-if="showStrengthLimitModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      @click.self="showStrengthLimitModal = false"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-gray-900">Vi rekommenderar butikshjälp</h3>
        <p class="mt-3 text-sm leading-6 text-gray-600">
          Vi vill leverera så bra kvalitet som möjligt, men när styrkorna överstiger 6
          krävs en noggrannhet som gör att vi tyvärr inte kan erbjuda detta online.
        </p>
        <p class="mt-3 text-sm leading-6 text-gray-600">
          Vi rekommenderar att du i stället får hjälp hos din lokala optiker.
        </p>
        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            @click="showStrengthLimitModal = false"
          >
            Okej
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

