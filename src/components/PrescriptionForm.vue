<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  /** When true (Avstånd/Allround), ADD and reading power are hidden – only sphere is relevant. */
  isDistanceOrAllround: {
    type: Boolean,
    default: false
  },
  /** When true (Läsavstånd), PD is adjusted toward near PD for ordering (optician rule). */
  isReadingDistance: {
    type: Boolean,
    default: false
  },
  /** When true (Progressiva glas), segment/fitting height in mm is required. */
  requiresHeight: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const ACCEPT = '.png,.jpg,.jpeg,.pdf';
/** Images only — used with capture hint so mobile can open the camera for the receipt */
const ACCEPT_IMAGES_ONLY = 'image/png,image/jpeg,.png,.jpg,.jpeg';
const MAX_SIZE_MB = 10;
const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

/** Touch-primary devices: `capture` usually opens the camera; on mouse-desktop it often becomes a file picker */
const showReceiptCameraCapture = ref(false);
let receiptCameraMql;

function syncReceiptCameraVisibility() {
  if (typeof window === 'undefined') return;
  showReceiptCameraCapture.value = window.matchMedia('(pointer: coarse)').matches;
}

onMounted(() => {
  syncReceiptCameraVisibility();
  receiptCameraMql = window.matchMedia('(pointer: coarse)');
  receiptCameraMql.addEventListener('change', syncReceiptCameraVisibility);
});

onUnmounted(() => {
  receiptCameraMql?.removeEventListener('change', syncReceiptCameraVisibility);
});

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

const axisOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 1; i <= 180; i++) opts.push({ value: String(i), label: String(i) });
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

// PD limits (mm); values must be whole or half millimeters (step 0.5)
const PD_PER_EYE_MIN = 25;
const PD_PER_EYE_MAX = 35;
const PD_BINOCULAR_MIN = 55;
const PD_BINOCULAR_MAX = 80;

/** Near-PD correction for reading glasses (convergence); per optician */
const NEAR_PD_DEDUCTION_PER_EYE_MM = 1.5;
const NEAR_PD_DEDUCTION_BINOCULAR_MM = 3;

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

/**
 * Validate PD string: range and 0.5 mm steps only (e.g. 25 and 25,5 ok; 23,3 not ok).
 */
function validatePdMmString(input, min, max) {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return { ok: false, message: '' };
  }
  let s = normalizePdInput(raw);
  if (/[.,]$/.test(s)) {
    return { ok: false, message: 'Komplettera värdet (t.ex. 25 eller 25,5).' };
  }
  if (!/^\d+(\.\d+)?$/.test(s)) {
    return { ok: false, message: 'Ogiltigt värde.' };
  }
  const num = Number(s);
  if (!Number.isFinite(num)) {
    return { ok: false, message: 'Ogiltigt värde.' };
  }
  if (num < min || num > max) {
    return {
      ok: false,
      message: `Värdet ska vara mellan ${min} och ${max} mm.`
    };
  }
  const doubled = num * 2;
  if (Math.abs(doubled - Math.round(doubled)) > 1e-6) {
    return {
      ok: false,
      message: 'Ange hel eller halv millimeter (t.ex. 25 eller 25,5).'
    };
  }
  const value = Math.round(doubled) / 2;
  return { ok: true, value };
}

function formatPdForForm(value) {
  if (value % 1 === 0) return String(Math.round(value));
  return String(value).replace('.', ',');
}

function onBlurPdPerEye(field) {
  const r = validatePdMmString(form.value[field], PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  if (r.ok) form.value[field] = formatPdForForm(r.value);
}

function onBlurPdBinocular() {
  const r = validatePdMmString(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
  if (r.ok) form.value.pd = formatPdForForm(r.value);
}

/** Canonical PD string for payload (dot decimal); submit only runs when valid */
function pdToPayload(raw, min, max) {
  const r = validatePdMmString(raw, min, max);
  if (r.ok) return String(r.value);
  return normalizePdInput(raw);
}

// Segment/fitting height for progressive lenses (mm)
const heightMmOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 15; i <= 35; i += 1) opts.push({ value: String(i), label: `${i} mm` });
  return opts;
})();

// Sphere and cylinder default 0.00 so lists open with 0 visible
const form = ref({
  right: { sphere: '0.00', cylinder: '0.00', axis: '', add: '' },
  left: { sphere: '0.00', cylinder: '0.00', axis: '', add: '' },
  pd: '',
  pdRight: '',
  pdLeft: '',
  /** When true, one PD value for both eyes; when false, separate right/left (default) */
  samePd: false,
  receiptNotOlderThanOneYear: false,
  /** Segment/fitting height in mm per eye (required for progressive lenses only) */
  heightMmRight: '',
  heightMmLeft: '',
  /** User has followed the height measuring instructions (required if they opened the guide) */
  heightInstructionsConfirmed: false,
  attachReceipt: false,
  receiptFileName: '',
  receiptFileSize: 0,
  receiptMimeType: '',
  receiptDataUrl: ''
});

// Height guide: once opened, user must confirm they followed instructions to submit
const showHeightGuide = ref(false);
const hasOpenedHeightGuide = ref(false);

function openHeightGuide() {
  showHeightGuide.value = true;
  hasOpenedHeightGuide.value = true;
}

const receiptError = ref('');

function clearReceipt() {
  form.value.receiptFileName = '';
  form.value.receiptFileSize = 0;
  form.value.receiptMimeType = '';
  form.value.receiptDataUrl = '';
  receiptError.value = '';
}

function onReceiptFileChange(event) {
  receiptError.value = '';
  const file = event.target?.files?.[0];
  if (!file) return;

  if (!acceptedTypes.includes(file.type)) {
    receiptError.value = 'Endast PNG, JPG och PDF är tillåtna.';
    event.target.value = '';
    clearReceipt();
    return;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    receiptError.value = `Filen får max vara ${MAX_SIZE_MB} MB.`;
    event.target.value = '';
    clearReceipt();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    form.value.receiptFileName = file.name;
    form.value.receiptFileSize = file.size;
    form.value.receiptMimeType = file.type;
    form.value.receiptDataUrl = reader.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

watch(
  () => form.value.attachReceipt,
  (attach) => {
    if (!attach) clearReceipt();
  }
);

const formTouched = ref(false);
const showStrengthLimitModal = ref(false);
const formErrors = ref({
  axisRight: '',
  axisLeft: '',
  addRight: '',
  addLeft: '',
  pdRight: '',
  pdLeft: '',
  pd: '',
  heightMmRight: '',
  heightMmLeft: '',
  heightInstructionsConfirmed: '',
  receiptNotOlderThanOneYear: '',
  receiptAttachment: ''
});

function validateManualForm() {
  const err = {
    axisRight: '',
    axisLeft: '',
    addRight: '',
    addLeft: '',
    pdRight: '',
    pdLeft: '',
    pd: '',
    heightMmRight: '',
    heightMmLeft: '',
    heightInstructionsConfirmed: '',
    receiptNotOlderThanOneYear: '',
    receiptAttachment: ''
  };

  const hasReceipt = form.value.attachReceipt && !!form.value.receiptDataUrl;
  const requiresAdd = props.isReadingDistance || props.requiresHeight;

  // If the user attaches a receipt, manual values are optional (optician can verify from the receipt).
  if (!hasReceipt) {
    if (form.value.right.cylinder && form.value.right.cylinder !== '0.00' && !form.value.right.axis) {
      err.axisRight = 'Fyll i axel för höger öga';
    }
    if (form.value.left.cylinder && form.value.left.cylinder !== '0.00' && !form.value.left.axis) {
      err.axisLeft = 'Fyll i axel för vänster öga';
    }

    if (form.value.samePd) {
      if (!form.value.pd?.trim()) {
        err.pd = 'Fyll i PD';
      } else {
        const r = validatePdMmString(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
        if (!r.ok) err.pd = r.message || 'Ogiltigt PD-värde';
      }
    } else {
      if (!form.value.pdRight?.trim()) {
        err.pdRight = 'Fyll i PD för höger öga';
      } else {
        const rR = validatePdMmString(form.value.pdRight, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
        if (!rR.ok) err.pdRight = rR.message || 'Ogiltigt PD-värde';
      }
      if (!form.value.pdLeft?.trim()) {
        err.pdLeft = 'Fyll i PD för vänster öga';
      } else {
        const rL = validatePdMmString(form.value.pdLeft, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
        if (!rL.ok) err.pdLeft = rL.message || 'Ogiltigt PD-värde';
      }
    }

    if (props.requiresHeight && !form.value.heightMmRight) {
      err.heightMmRight = 'Välj monteringshöjd för höger öga (mm)';
    }
    if (props.requiresHeight && !form.value.heightMmLeft) {
      err.heightMmLeft = 'Välj monteringshöjd för vänster öga (mm)';
    }
    if (props.requiresHeight && hasOpenedHeightGuide.value && !form.value.heightInstructionsConfirmed) {
      err.heightInstructionsConfirmed = 'Bekräfta att du har följt instruktionerna';
    }

    if (requiresAdd && !props.isDistanceOrAllround) {
      if (!form.value.right.add) err.addRight = 'Välj ADD för höger öga';
      if (!form.value.left.add) err.addLeft = 'Välj ADD för vänster öga';
    }
  }

  if (!form.value.receiptNotOlderThanOneYear) {
    err.receiptNotOlderThanOneYear = 'Du måste intyga att du skrivit in rätt styrkor';
  }

  if (form.value.attachReceipt && !form.value.receiptDataUrl) {
    err.receiptAttachment = 'Bifoga en fil eller avmarkera valet';
  }

  formErrors.value = err;
  return !Object.values(err).some(Boolean);
}

// After the user tries to continue once, keep validation in sync
// so errors disappear as soon as fields are corrected.
watch(
  [form, () => props.requiresHeight, hasOpenedHeightGuide],
  () => {
    if (!formTouched.value) return;
    validateManualForm();
  },
  { deep: true }
);

const canSubmit = computed(() => {
  const r = form.value.right;
  const l = form.value.left;
  const requiresAdd = props.isReadingDistance || props.requiresHeight;
  const hasSphere = r.sphere !== '' || l.sphere !== '';
  const axisOk =
    (!r.cylinder || r.cylinder === '0.00' || r.axis !== '') &&
    (!l.cylinder || l.cylinder === '0.00' || l.axis !== '');
  const addOk = !requiresAdd || (r.add !== '' && l.add !== '');
  const pdBinocularOk =
    form.value.samePd &&
    validatePdMmString(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX).ok;
  const pdSplitOk =
    !form.value.samePd &&
    validatePdMmString(form.value.pdRight, PD_PER_EYE_MIN, PD_PER_EYE_MAX).ok &&
    validatePdMmString(form.value.pdLeft, PD_PER_EYE_MIN, PD_PER_EYE_MAX).ok;
  const hasPd = form.value.samePd ? pdBinocularOk : pdSplitOk;
  const heightOk =
    !props.requiresHeight ||
    (form.value.heightMmRight !== '' &&
      form.value.heightMmLeft !== '' &&
      (!hasOpenedHeightGuide.value || form.value.heightInstructionsConfirmed));
  const hasReceipt = form.value.attachReceipt && !!form.value.receiptDataUrl;
  const manualOk = hasSphere && axisOk && addOk && hasPd && heightOk;
  return (hasReceipt || manualOk) && form.value.receiptNotOlderThanOneYear;
});

function parsePrescriptionNumber(value) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getSphereCylinderTotal(eye) {
  return parsePrescriptionNumber(eye?.sphere) + parsePrescriptionNumber(eye?.cylinder);
}

const exceedsSphereCylinderLimit = computed(() => {
  return [form.value.right, form.value.left].some((eye) => Math.abs(getSphereCylinderTotal(eye)) > 6);
});

const shouldBlockPrescriptionFlow = computed(() => {
  return exceedsSphereCylinderLimit.value;
});

// Reading power = Sphere + ADD (only relevant when not distance/allround)
const readingPower = computed(() => {
  if (props.isDistanceOrAllround) return { right: null, left: null };
  const r = form.value.right;
  const l = form.value.left;
  const calc = (sphere, add) => {
    const s = parseFloat(sphere);
    const a = parseFloat(add);
    if (Number.isNaN(s) && Number.isNaN(a)) return null;
    const sum = (Number.isNaN(s) ? 0 : s) + (Number.isNaN(a) ? 0 : a);
    return sum >= 0 ? `+${sum.toFixed(2)}` : sum.toFixed(2);
  };
  return { right: calc(r.sphere, r.add), left: calc(l.sphere, l.add) };
});

// Near PD preview (same deduction as in getPdForManualPayload)
const readingNearPdPreview = computed(() => {
  if (!props.isReadingDistance && !props.requiresHeight) return null;
  if (form.value.samePd) {
    const r = validatePdMmString(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
    if (!r.ok) {
      return { samePd: true, binoc: null, right: null, left: null };
    }
    const near = roundPdHalfStepMm(r.value - NEAR_PD_DEDUCTION_BINOCULAR_MM);
    return { samePd: true, binoc: formatPdForForm(near), right: null, left: null };
  }
  const rR = validatePdMmString(form.value.pdRight, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  const rL = validatePdMmString(form.value.pdLeft, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
  if (!rR.ok || !rL.ok) {
    return { samePd: false, binoc: null, right: null, left: null };
  }
  return {
    samePd: false,
    binoc: null,
    right: formatPdForForm(roundPdHalfStepMm(rR.value - NEAR_PD_DEDUCTION_PER_EYE_MM)),
    left: formatPdForForm(roundPdHalfStepMm(rL.value - NEAR_PD_DEDUCTION_PER_EYE_MM))
  };
});

function getPdForManualPayload() {
  if (props.isReadingDistance || props.requiresHeight) {
    if (form.value.samePd) {
      const r = validatePdMmString(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
      if (!r.ok) {
        return pdToPayload(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
      }
      return String(roundPdHalfStepMm(r.value - NEAR_PD_DEDUCTION_BINOCULAR_MM));
    }
    const rR = validatePdMmString(form.value.pdRight, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
    const rL = validatePdMmString(form.value.pdLeft, PD_PER_EYE_MIN, PD_PER_EYE_MAX);
    if (!rR.ok || !rL.ok) {
      return {
        right: pdToPayload(form.value.pdRight, PD_PER_EYE_MIN, PD_PER_EYE_MAX),
        left: pdToPayload(form.value.pdLeft, PD_PER_EYE_MIN, PD_PER_EYE_MAX)
      };
    }
    return {
      right: String(roundPdHalfStepMm(rR.value - NEAR_PD_DEDUCTION_PER_EYE_MM)),
      left: String(roundPdHalfStepMm(rL.value - NEAR_PD_DEDUCTION_PER_EYE_MM))
    };
  }
  if (form.value.samePd) {
    return pdToPayload(form.value.pd, PD_BINOCULAR_MIN, PD_BINOCULAR_MAX);
  }
  return {
    right: pdToPayload(form.value.pdRight, PD_PER_EYE_MIN, PD_PER_EYE_MAX),
    left: pdToPayload(form.value.pdLeft, PD_PER_EYE_MIN, PD_PER_EYE_MAX)
  };
}

// Clear axis when cylinder is removed or set to 0 (no astigmatism)
watch(
  () => [form.value.right.cylinder, form.value.left.cylinder],
  ([cylR, cylL]) => {
    if (!cylR || cylR === '0.00') form.value.right.axis = '';
    if (!cylL || cylL === '0.00') form.value.left.axis = '';
  }
);

watch(shouldBlockPrescriptionFlow, (shouldBlock, wasBlocked) => {
  if (shouldBlock && !wasBlocked) {
    showStrengthLimitModal.value = true;
    return;
  }

  if (!shouldBlock) {
    showStrengthLimitModal.value = false;
  }
});

function getPayload() {
  const right = { ...form.value.right };
  const left = { ...form.value.left };
  // For distance/allround, only sphere (and cylinder/axis) matter; do not include ADD
  if (props.isDistanceOrAllround) {
    delete right.add;
    delete left.add;
  }
  const manual = {
    right,
    left,
    pd: getPdForManualPayload(),
    receiptNotOlderThanOneYear: form.value.receiptNotOlderThanOneYear
  };
  if (
    props.requiresHeight &&
    form.value.heightMmRight !== '' &&
    form.value.heightMmLeft !== ''
  ) {
    manual.heightMm = { right: form.value.heightMmRight, left: form.value.heightMmLeft };
  }
  const payload = { title: 'Manuellt', type: 'manual', manual };
  if (form.value.attachReceipt && form.value.receiptDataUrl) {
    payload.fileName = form.value.receiptFileName;
    payload.fileSize = form.value.receiptFileSize;
    payload.mimeType = form.value.receiptMimeType;
    payload.dataUrl = form.value.receiptDataUrl;
  }
  return payload;
}

function submit() {
  formTouched.value = true;
  if (!validateManualForm()) return;
  if (!canSubmit.value) return;
  if (shouldBlockPrescriptionFlow.value) {
    showStrengthLimitModal.value = true;
    return;
  }
  emit('submit', getPayload());
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <p class="mb-4 text-center text-sm text-gray-600">
      Fyll i ditt glasögonrecept. Det är inte alla recept som har cylinder och axel – lämna dessa tomma om de inte finns.
    </p>

    <!-- Glasses diagram: front view so Höger/Vänster match form columns (viewer perspective) -->
    <div class="mb-6 flex flex-col items-center gap-2">
      <div class="flex items-center justify-center" aria-hidden="true">
        <svg
          viewBox="0 0 220 92"
          class="h-24 w-auto max-w-[220px] text-slate-400"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lensFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#e5edf8" stop-opacity="0.9" />
            </linearGradient>
          </defs>
          <!-- Bridge -->
          <path d="M103 46 H117" stroke-linecap="round" />
          <!-- Left lens (wearer's right = Höger) -->
          <circle cx="75" cy="46" r="28" fill="url(#lensFill)" stroke-width="2" />
          <text
            x="75"
            y="46"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="22"
            font-weight="700"
            fill="#475569"
            font-family="system-ui, sans-serif"
          >
            H
          </text>
          <!-- Right lens (wearer's left = Vänster) -->
          <circle cx="145" cy="46" r="28" fill="url(#lensFill)" stroke-width="2" />
          <text
            x="145"
            y="46"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="22"
            font-weight="700"
            fill="#475569"
            font-family="system-ui, sans-serif"
          >
            V
          </text>
        </svg>
      </div>
    </div>

    <p
      v-if="formTouched && Object.values(formErrors).some(Boolean)"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      Kontrollera fälten markerade i rött för att kunna fortsätta.
    </p>

    <!-- Column headers -->
    <div class="mb-3 grid grid-cols-2 gap-4 text-sm font-medium text-gray-700">
      <div class="justify-self-start">Höger öga (OD)</div>
      <div class="justify-self-start">Vänster öga (OS)</div>
    </div>

    <!-- Sphere -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">Sfär (SF)</label>
      <div class="grid grid-cols-2 gap-4">
        <select v-model="form.right.sphere" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in sphereOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="form.left.sphere" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in sphereOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <!-- Cylinder -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">Cylinder (CYL)</label>

      <div class="grid grid-cols-2 gap-4">
        <select v-model="form.right.cylinder" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in cylinderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="form.left.cylinder" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in cylinderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
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

    <!-- Axel – Only when cylinder is selected for each eye -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">Axel</label>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <input
            v-model="form.right.axis"
            type="text"
            placeholder="1–180"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
            maxlength="3"
            :disabled="!form.right.cylinder || form.right.cylinder === '0.00'"
            :aria-invalid="formTouched && !!formErrors.axisRight"
            :aria-describedby="formTouched && formErrors.axisRight ? 'err-axisRight' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.axisRight }"
          />
          <p v-if="formTouched && formErrors.axisRight" id="err-axisRight" class="mt-1 text-sm text-red-600">
            {{ formErrors.axisRight }}
          </p>
        </div>
        <div>
          <input
            v-model="form.left.axis"
            type="text"
            placeholder="1–180"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
            maxlength="3"
            :disabled="!form.left.cylinder || form.left.cylinder === '0.00'"
            :aria-invalid="formTouched && !!formErrors.axisLeft"
            :aria-describedby="formTouched && formErrors.axisLeft ? 'err-axisLeft' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.axisLeft }"
          />
          <p v-if="formTouched && formErrors.axisLeft" id="err-axisLeft" class="mt-1 text-sm text-red-600">
            {{ formErrors.axisLeft }}
          </p>
        </div>
      </div>
    </div>

    <!-- Addition: only for near/reading use (hidden for Avstånd/Allround) -->
    <div v-if="!isDistanceOrAllround" class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">
        Addition (ADD)
        <span v-if="isReadingDistance || requiresHeight" class="text-gray-900" aria-hidden="true">*</span>
      </label>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <select
            v-model="form.right.add"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.addRight"
            :aria-describedby="formTouched && formErrors.addRight ? 'err-addRight' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.addRight }"
          >
          <option v-for="opt in addOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="formTouched && formErrors.addRight" id="err-addRight" class="mt-1 text-sm text-red-600">{{ formErrors.addRight }}</p>
        </div>
        <div>
          <select
            v-model="form.left.add"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.addLeft"
            :aria-describedby="formTouched && formErrors.addLeft ? 'err-addLeft' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.addLeft }"
          >
          <option v-for="opt in addOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="formTouched && formErrors.addLeft" id="err-addLeft" class="mt-1 text-sm text-red-600">{{ formErrors.addLeft }}</p>
        </div>
      </div>
    </div>

    <!-- Reading power (Sphere + ADD): only relevant for near/reading; hidden for Avstånd/Allround -->
    <div v-if="!isDistanceOrAllround" class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p class="mb-2 text-sm font-medium text-gray-700">Lässtyrka (beräknad)</p>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-gray-500">Höger öga (OD)</div>
          <div class="font-medium text-gray-900">{{ readingPower.right ?? '—' }}</div>
        </div>
        <div>
          <div class="text-gray-500">Vänster öga (OS)</div>
          <div class="font-medium text-gray-900">{{ readingPower.left ?? '—' }}</div>
        </div>
      </div>
    </div>

    <!-- Segment/fitting height: required for progressive lenses only (per eye) -->
    <div v-if="requiresHeight" class="mb-6">
      <label class="mb-2 block text-sm font-medium text-gray-700">Monteringshöjd (mm) *</label>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-xs text-gray-500">Höger öga (OD)</label>
          <select
            v-model="form.heightMmRight"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.heightMmRight"
            :aria-describedby="formTouched && formErrors.heightMmRight ? 'err-heightMmRight' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.heightMmRight }"
          >
            <option v-for="opt in heightMmOptions" :key="`hr-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="formTouched && formErrors.heightMmRight" id="err-heightMmRight" class="mt-1 text-sm text-red-600">
            {{ formErrors.heightMmRight }}
          </p>
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">Vänster öga (OS)</label>
          <select
            v-model="form.heightMmLeft"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.heightMmLeft"
            :aria-describedby="formTouched && formErrors.heightMmLeft ? 'err-heightMmLeft' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.heightMmLeft }"
          >
            <option v-for="opt in heightMmOptions" :key="`hl-${opt.value}`" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="formTouched && formErrors.heightMmLeft" id="err-heightMmLeft" class="mt-1 text-sm text-red-600">
            {{ formErrors.heightMmLeft }}
          </p>
        </div>
      </div>

      <!-- "I don't have a height – how do I measure?" expandable guide -->
      <div class="mt-3 grid grid-cols-2 gap-4">
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100 hover:border-gray-300"
          @click="openHeightGuide"
        >
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-500">?</span>
          <span>Jag har ingen höjd – hur mäter jag det?</span>
        </button>
        <div aria-hidden="true"></div>
      </div>

      <!-- Step-by-step height measuring guide -->
      <div
        v-if="showHeightGuide"
        class="mt-4 max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <p class="mb-3 font-medium text-gray-800">Så mäter du monteringshöjden</p>
        <ol class="list-decimal space-y-2 pl-4 text-sm text-gray-700">
          <li>Ta på dig bågen (utan glas) och sätt dig framför en spegel.</li>
          <li>Titta rakt fram med huvudet i naturlig ställning.</li>
          <li>Mät med en linjal från nederkanten av linsöppningen (eller bågens inre kant) upp till mitt av pupillen – i millimeter.</li>
          <li>Upprepa för andra ögat och notera värdet (ofta samma för båda). Avrunda till närmaste heltal.</li>
        </ol>
        <p class="mt-3 text-xs text-gray-500">
          Har du redan ett recept med monteringshöjd angiven, använd det värdet.
        </p>
        <div class="mt-4 flex items-start gap-3 rounded border border-gray-200 bg-white p-3">
          <input
            id="height-instructions-confirmed"
            v-model="form.heightInstructionsConfirmed"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300"
            :aria-invalid="formTouched && !!formErrors.heightInstructionsConfirmed"
            :aria-describedby="formTouched && formErrors.heightInstructionsConfirmed ? 'err-heightInstructionsConfirmed' : undefined"
          />
          <label for="height-instructions-confirmed" class="text-sm text-gray-700">
            Jag har följt instruktionerna och mätt höjden (eller använt värdet från receptet).
          </label>
        </div>
        <p
          v-if="formTouched && formErrors.heightInstructionsConfirmed"
          id="err-heightInstructionsConfirmed"
          class="mt-2 text-sm text-red-600"
        >
          {{ formErrors.heightInstructionsConfirmed }}
        </p>
      </div>
    </div>

    <!-- Pupillary distance (PD): default separate right/left; checkbox for same both eyes -->
    <div class="mb-6">
      <label class="mb-2 block text-sm font-medium text-gray-700">Pupillavstånd (PD) *</label>
      <div v-if="!form.samePd" class="mb-3 grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-xs text-gray-500">Höger öga (OD)</label>
          <div class="flex items-center gap-2">
            <input
              v-model="form.pdRight"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900"
              :aria-invalid="formTouched && !!formErrors.pdRight"
              :aria-describedby="formTouched && formErrors.pdRight ? 'err-pdRight' : undefined"
              :class="{ 'border-red-500': formTouched && formErrors.pdRight }"
              @blur="onBlurPdPerEye('pdRight')"
            />
            <span class="shrink-0 text-sm text-gray-500">mm</span>
          </div>
          <p v-if="formTouched && formErrors.pdRight" id="err-pdRight" class="mt-1 text-sm text-red-600">{{ formErrors.pdRight }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">Vänster öga (OS)</label>
          <div class="flex items-center gap-2">
            <input
              v-model="form.pdLeft"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900"
              :aria-invalid="formTouched && !!formErrors.pdLeft"
              :aria-describedby="formTouched && formErrors.pdLeft ? 'err-pdLeft' : undefined"
              :class="{ 'border-red-500': formTouched && formErrors.pdLeft }"
              @blur="onBlurPdPerEye('pdLeft')"
            />
            <span class="shrink-0 text-sm text-gray-500">mm</span>
          </div>
          <p v-if="formTouched && formErrors.pdLeft" id="err-pdLeft" class="mt-1 text-sm text-red-600">{{ formErrors.pdLeft }}</p>
        </div>
      </div>
      <div v-else class="mb-3 flex max-w-xs flex-col gap-2">
        <div class="flex items-center gap-2">
          <input
            v-model="form.pd"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            class="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.pd"
            :aria-describedby="formTouched && formErrors.pd ? 'err-pd' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.pd }"
            @blur="onBlurPdBinocular()"
          />
          <span class="shrink-0 text-sm text-gray-500">mm</span>
        </div>
        <p v-if="formTouched && formErrors.pd" id="err-pd" class="text-sm text-red-600">{{ formErrors.pd }}</p>
      </div>
      <div class="flex items-center gap-2">
        <input
          id="same-pd"
          v-model="form.samePd"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300"
        />
        <label for="same-pd" class="text-sm text-gray-700">Jag har ett sammanslaget PD</label>
      </div>

      <!-- Near PD: convergence correction (matches order payload) -->
      <div
        v-if="isReadingDistance || requiresHeight"
        class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
      >
        <p class="mb-2 text-sm font-medium text-gray-700">När-PD (beräknad)</p>
        <template v-if="readingNearPdPreview?.samePd">
          <div class="text-sm">
            <span class="text-gray-500">Totalt när-PD:</span>
            <span class="ml-2 font-medium text-gray-900">
              {{ readingNearPdPreview.binoc != null ? `${readingNearPdPreview.binoc} mm` : '—' }}
            </span>
          </div>
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Höger öga (OD):</span>
              <span class="ml-2 font-medium text-gray-900">
                {{ readingNearPdPreview?.right != null ? `${readingNearPdPreview.right} mm` : '—' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">Vänster öga (OS):</span>
              <span class="ml-2 font-medium text-gray-900">
                {{ readingNearPdPreview?.left != null ? `${readingNearPdPreview.left} mm` : '—' }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Attestation: correct strengths entered -->
    <div class="mb-6 flex items-center gap-2">
      <input
        id="receipt-age"
        v-model="form.receiptNotOlderThanOneYear"
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300"
        :aria-invalid="formTouched && !!formErrors.receiptNotOlderThanOneYear"
        :aria-describedby="formTouched && formErrors.receiptNotOlderThanOneYear ? 'err-receiptNotOlderThanOneYear' : undefined"
      />
      <label for="receipt-age" class="text-sm text-gray-700">
        Jag intygar att jag skrivit in rätt styrkor <span class="text-gray-900" aria-hidden="true">*</span>
      </label>
    </div>
    <p
      v-if="formTouched && formErrors.receiptNotOlderThanOneYear"
      id="err-receiptNotOlderThanOneYear"
      class="-mt-4 mb-6 text-sm text-red-600"
    >
      {{ formErrors.receiptNotOlderThanOneYear }}
    </p>

    <!-- Optional: attach receipt to manual entry -->
    <div class="mb-6">
      <div class="flex items-center gap-2">
        <input
          id="attach-receipt"
          v-model="form.attachReceipt"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300"
        />
        <label for="attach-receipt" class="text-sm font-medium text-gray-700">Jag har ett recept att bifoga</label>
      </div>

      <div v-if="form.attachReceipt" class="mt-3 max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p class="mb-3 text-sm text-gray-700">
          Bifoga en bild (PNG/JPG) eller PDF av ditt recept (max {{ MAX_SIZE_MB }} MB).
        </p>
        <p v-if="showReceiptCameraCapture" class="mb-3 text-xs text-gray-500">
          Du kan fota receptet med kameran eller välja en bild från enheten.
          PDF kan bara laddas upp via &quot;Välj fil&quot;.
        </p>
        <p v-else class="mb-3 text-xs text-gray-500">
          Välj en bild eller PDF från din dator. På mobil och surfplatta visas också en knapp för att ta foto direkt med kameran.
        </p>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label
            class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <input type="file" class="sr-only" :accept="ACCEPT" @change="onReceiptFileChange" />
            Välj fil (bild eller PDF)
          </label>
          <label
            v-if="showReceiptCameraCapture"
            class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <input
              type="file"
              class="sr-only"
              :accept="ACCEPT_IMAGES_ONLY"
              capture="environment"
              @change="onReceiptFileChange"
            />
            Ta foto med kameran
          </label>
        </div>

        <div v-if="form.receiptDataUrl" class="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-gray-900">{{ form.receiptFileName }}</p>
            <p class="text-xs text-gray-500">{{ Math.round((form.receiptFileSize / (1024 * 1024)) * 10) / 10 }} MB</p>
          </div>
          <button
            type="button"
            class="ml-3 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="clearReceipt"
          >
            Ta bort
          </button>
        </div>

        <p v-if="receiptError" class="mt-3 text-sm text-red-600">{{ receiptError }}</p>
        <p v-if="formTouched && formErrors.receiptAttachment" class="mt-2 text-sm text-red-600">{{ formErrors.receiptAttachment }}</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        :aria-disabled="!canSubmit"
        class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        :class="!canSubmit ? 'opacity-50 cursor-not-allowed hover:bg-blue-600' : ''"
        @click="submit"
      >
        Fortsätt
      </button>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        @click="cancel"
      >
        Avbryt
      </button>
    </div>

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
