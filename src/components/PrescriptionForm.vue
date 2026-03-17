<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  /** When true (Avstånd/Allround), ADD and reading power are hidden – only sphere is relevant. */
  isDistanceOrAllround: {
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
const MAX_SIZE_MB = 10;
const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

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

// Per-eye PD (monocular): 25–35 mm
const pdOptionsPerEye = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 25; i <= 35; i += 1) opts.push({ value: String(i), label: `${i} mm` });
  return opts;
})();

// Binocular PD (same for both eyes): 55–80 mm
const pdOptionsBinocular = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 55; i <= 80; i += 1) opts.push({ value: String(i), label: `${i} mm` });
  return opts;
})();

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
  /** Segment/fitting height in mm (required for progressive lenses only) */
  heightMm: '',
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
const formErrors = ref({
  pdRight: '',
  pdLeft: '',
  pd: '',
  heightMm: '',
  heightInstructionsConfirmed: '',
  receiptNotOlderThanOneYear: '',
  receiptAttachment: ''
});

function validateManualForm() {
  const err = {
    pdRight: '',
    pdLeft: '',
    pd: '',
    heightMm: '',
    heightInstructionsConfirmed: '',
    receiptNotOlderThanOneYear: '',
    receiptAttachment: ''
  };

  const hasReceipt = form.value.attachReceipt && !!form.value.receiptDataUrl;

  // If the user attaches a receipt, manual values are optional (optician can verify from the receipt).
  if (!hasReceipt) {
    if (form.value.samePd) {
      if (!form.value.pd) err.pd = 'Välj PD';
    } else {
      if (!form.value.pdRight) err.pdRight = 'Välj PD för höger öga';
      if (!form.value.pdLeft) err.pdLeft = 'Välj PD för vänster öga';
    }

    if (props.requiresHeight && !form.value.heightMm) {
      err.heightMm = 'Välj höjd (mm)';
    }
    if (props.requiresHeight && hasOpenedHeightGuide.value && !form.value.heightInstructionsConfirmed) {
      err.heightInstructionsConfirmed = 'Bekräfta att du har följt instruktionerna';
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
  const hasSphere = r.sphere !== '' || l.sphere !== '';
  const hasPd = form.value.samePd
    ? form.value.pd !== ''
    : (form.value.pdRight !== '' && form.value.pdLeft !== '');
  const heightOk =
    !props.requiresHeight ||
    (form.value.heightMm !== '' &&
      (!hasOpenedHeightGuide.value || form.value.heightInstructionsConfirmed));
  const hasReceipt = form.value.attachReceipt && !!form.value.receiptDataUrl;
  const manualOk = hasSphere && hasPd && heightOk;
  return (hasReceipt || manualOk) && form.value.receiptNotOlderThanOneYear;
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

// Clear axis when cylinder is removed or set to 0 (no astigmatism)
watch(
  () => [form.value.right.cylinder, form.value.left.cylinder],
  ([cylR, cylL]) => {
    if (!cylR || cylR === '0.00') form.value.right.axis = '';
    if (!cylL || cylL === '0.00') form.value.left.axis = '';
  }
);

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
    pd: form.value.samePd ? form.value.pd : { right: form.value.pdRight, left: form.value.pdLeft },
    receiptNotOlderThanOneYear: form.value.receiptNotOlderThanOneYear
  };
  if (props.requiresHeight && form.value.heightMm !== '') {
    manual.heightMm = form.value.heightMm;
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
  emit('submit', getPayload());
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-center text-lg font-semibold text-gray-900">
      Lägg till dina styrkor manuellt
    </h3>
    <p class="mb-4 text-center text-sm text-gray-600">
      Fyll i ditt glasögonrecept. Det är inte alla recept som har cylinder och axel – lämna dessa tomma om de inte finns.
    </p>

    <!-- Glasses diagram: front view so Höger/Vänster match form columns (viewer perspective) -->
    <div class="mb-6 flex flex-col items-center gap-2">
      <p class="text-xs text-gray-500 text-center">
        Receptet anges som man ser dig framifrån – därför står höger till vänster i formuläret.
      </p>
      <div class="flex items-center justify-center" aria-hidden="true">
        <svg
          viewBox="0 0 200 80"
          class="h-20 w-auto max-w-[200px] text-gray-400"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Left lens (wearer's right = Höger) -->
          <ellipse cx="60" cy="40" rx="32" ry="28" stroke-width="2" />
          <text x="60" y="44" text-anchor="middle" font-size="22" font-weight="600" fill="#4b5563" font-family="system-ui, sans-serif">H</text>
          <!-- Right lens (wearer's left = Vänster) -->
          <ellipse cx="140" cy="40" rx="32" ry="28" stroke-width="2" />
          <text x="140" y="44" text-anchor="middle" font-size="22" font-weight="600" fill="#4b5563" font-family="system-ui, sans-serif">V</text>
          <!-- Bridge -->
          <path d="M92 32 L108 32" stroke-linecap="round" />
          <!-- Left temple -->
          <path d="M28 40 L8 40" stroke-linecap="round" />
          <!-- Right temple -->
          <path d="M172 40 L192 40" stroke-linecap="round" />
        </svg>
      </div>
      <p class="text-xs text-gray-500 text-center">
        <span class="font-medium text-gray-600">H</span> = Höger öga (OD) &nbsp;·&nbsp; <span class="font-medium text-gray-600">V</span> = Vänster öga (OS)
      </p>
    </div>

    <p
      v-if="formTouched && Object.values(formErrors).some(Boolean)"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      Kontrollera fälten markerade i rött för att kunna fortsätta.
    </p>

    <!-- Column headers -->
    <div class="mb-3 grid grid-cols-2 gap-4 text-sm font-medium text-gray-700 md:grid-cols-4">
      <div class="hidden md:block"></div>
      <div>Höger öga (OD)</div>
      <div>Vänster öga (OS)</div>
      <div class="hidden md:block"></div>
    </div>

    <!-- Sphere -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">Sfär (SF) *</label>
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
      <p class="mb-2 text-xs text-gray-500">
        Det är inte alla recept som har detta värde. Lämna fältet tomt om det inte finns på ditt recept.
      </p>
      <div class="grid grid-cols-2 gap-4">
        <select v-model="form.right.cylinder" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in cylinderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="form.left.cylinder" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in cylinderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <!-- Axel – Only when cylinder is selected for each eye -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">Axel</label>
      <p class="mb-2 text-xs text-gray-500">
        Endast recept med värden i cylinderfälten har denna information. Välj cylinder först för att kunna fylla i axel.
      </p>
      <div class="grid grid-cols-2 gap-4">
        <input
          v-model="form.right.axis"
          type="text"
          placeholder="1–180"
          class="rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
          maxlength="3"
          :disabled="!form.right.cylinder || form.right.cylinder === '0.00'"
        />
        <input
          v-model="form.left.axis"
          type="text"
          placeholder="1–180"
          class="rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
          maxlength="3"
          :disabled="!form.left.cylinder || form.left.cylinder === '0.00'"
        />
      </div>
    </div>

    <!-- Addition: only for near/reading use (hidden for Avstånd/Allround) -->
    <div v-if="!isDistanceOrAllround" class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700">Addition (ADD)</label>
      <div class="grid grid-cols-2 gap-4">
        <select v-model="form.right.add" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in addOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="form.left.add" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in addOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <!-- Reading power (Sphere + ADD): only relevant for near/reading; hidden for Avstånd/Allround -->
    <div v-if="!isDistanceOrAllround" class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p class="mb-2 text-sm font-medium text-gray-700">Lässtyrka (beräknad)</p>
      <p class="mb-2 text-xs text-gray-500">
        Sfär + Addition = styrka för närbild. Visas endast som information.
      </p>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Höger öga (OD):</span>
          <span class="ml-2 font-medium text-gray-900">{{ readingPower.right ?? '—' }}</span>
        </div>
        <div>
          <span class="text-gray-500">Vänster öga (OS):</span>
          <span class="ml-2 font-medium text-gray-900">{{ readingPower.left ?? '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Segment/fitting height: required for progressive lenses only -->
    <div v-if="requiresHeight" class="mb-6">
      <label class="mb-2 block text-sm font-medium text-gray-700">Höjd (mm) *</label>
      <p class="mb-2 text-xs text-gray-500">
        Monteringshöjd för progressiva glas.
      </p>
      <div class="grid grid-cols-1 gap-4 max-w-xs">
        <select
          v-model="form.heightMm"
          class="rounded border border-gray-300 px-3 py-2 text-gray-900"
          :aria-invalid="formTouched && !!formErrors.heightMm"
          :aria-describedby="formTouched && formErrors.heightMm ? 'err-heightMm' : undefined"
          :class="{ 'border-red-500': formTouched && formErrors.heightMm }"
        >
          <option v-for="opt in heightMmOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="formTouched && formErrors.heightMm" id="err-heightMm" class="mt-1 text-sm text-red-600">{{ formErrors.heightMm }}</p>
      </div>

      <!-- "I don't have a height – how do I measure?" expandable guide -->
      <button
        type="button"
        class="mt-3 flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100 hover:border-gray-300"
        @click="openHeightGuide"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-500">?</span>
        <span>Jag har ingen höjd – hur mäter jag det?</span>
      </button>

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
          <select
            v-model="form.pdRight"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.pdRight"
            :aria-describedby="formTouched && formErrors.pdRight ? 'err-pdRight' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.pdRight }"
          >
            <option v-for="opt in pdOptionsPerEye" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="formTouched && formErrors.pdRight" id="err-pdRight" class="mt-1 text-sm text-red-600">{{ formErrors.pdRight }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">Vänster öga (OS)</label>
          <select
            v-model="form.pdLeft"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
            :aria-invalid="formTouched && !!formErrors.pdLeft"
            :aria-describedby="formTouched && formErrors.pdLeft ? 'err-pdLeft' : undefined"
            :class="{ 'border-red-500': formTouched && formErrors.pdLeft }"
          >
            <option v-for="opt in pdOptionsPerEye" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="formTouched && formErrors.pdLeft" id="err-pdLeft" class="mt-1 text-sm text-red-600">{{ formErrors.pdLeft }}</p>
        </div>
      </div>
      <div v-else class="mb-3 grid grid-cols-1 gap-4 max-w-xs">
        <select
          v-model="form.pd"
          class="rounded border border-gray-300 px-3 py-2 text-gray-900"
          :aria-invalid="formTouched && !!formErrors.pd"
          :aria-describedby="formTouched && formErrors.pd ? 'err-pd' : undefined"
          :class="{ 'border-red-500': formTouched && formErrors.pd }"
        >
          <option v-for="opt in pdOptionsBinocular" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="formTouched && formErrors.pd" id="err-pd" class="mt-1 text-sm text-red-600">{{ formErrors.pd }}</p>
      </div>
      <div class="flex items-center gap-2">
        <input
          id="same-pd"
          v-model="form.samePd"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300"
        />
        <label for="same-pd" class="text-sm text-gray-700">Jag har samma PD för höger och vänster</label>
      </div>
    </div>

    <!-- Attestation: correct strengths entered -->
    <div class="mb-6 flex items-start gap-3">
      <input
        id="receipt-age"
        v-model="form.receiptNotOlderThanOneYear"
        type="checkbox"
        class="mt-1 h-4 w-4 rounded border-gray-300"
        :aria-invalid="formTouched && !!formErrors.receiptNotOlderThanOneYear"
        :aria-describedby="formTouched && formErrors.receiptNotOlderThanOneYear ? 'err-receiptNotOlderThanOneYear' : undefined"
      />
      <label for="receipt-age" class="text-sm text-gray-700">
        jag intygar att jag skrivit in rätt styrkor
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

        <input
          type="file"
          :accept="ACCEPT"
          class="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
          @change="onReceiptFileChange"
        />

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
  </div>
</template>
