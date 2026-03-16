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

const pdOptions = (() => {
  const opts = [{ value: '', label: 'Välj' }];
  for (let i = 21; i <= 45; i += 1) opts.push({ value: String(i), label: `${i} mm` });
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
  separatePd: false,
  receiptNotOlderThanOneYear: false,
  /** Segment/fitting height in mm (required for progressive lenses only) */
  heightMm: '',
  /** User has followed the height measuring instructions (required if they opened the guide) */
  heightInstructionsConfirmed: false
});

// Height guide: once opened, user must confirm they followed instructions to submit
const showHeightGuide = ref(false);
const hasOpenedHeightGuide = ref(false);

function openHeightGuide() {
  showHeightGuide.value = true;
  hasOpenedHeightGuide.value = true;
}

const canSubmit = computed(() => {
  const r = form.value.right;
  const l = form.value.left;
  const hasSphere = r.sphere !== '' || l.sphere !== '';
  const hasPd = form.value.separatePd
    ? (form.value.pdRight !== '' && form.value.pdLeft !== '')
    : form.value.pd !== '';
  const heightOk =
    !props.requiresHeight ||
    (form.value.heightMm !== '' &&
      (!hasOpenedHeightGuide.value || form.value.heightInstructionsConfirmed));
  return hasSphere && hasPd && form.value.receiptNotOlderThanOneYear && heightOk;
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
    pd: form.value.separatePd ? { right: form.value.pdRight, left: form.value.pdLeft } : form.value.pd,
    receiptNotOlderThanOneYear: form.value.receiptNotOlderThanOneYear
  };
  if (props.requiresHeight && form.value.heightMm !== '') {
    manual.heightMm = form.value.heightMm;
  }
  return {
    title: 'Manuellt',
    manual
  };
}

function submit() {
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
        <select v-model="form.heightMm" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in heightMmOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
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
          />
          <label for="height-instructions-confirmed" class="text-sm text-gray-700">
            Jag har följt instruktionerna och mätt höjden (eller använt värdet från receptet).
          </label>
        </div>
      </div>
    </div>

    <!-- Pupillary distance (PD) -->
    <div class="mb-6">
      <label class="mb-2 block text-sm font-medium text-gray-700">Pupillavstånd (PD) *</label>
      <div class="mb-3 flex items-center gap-2">
        <input
          id="separate-pd"
          v-model="form.separatePd"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300"
        />
        <label for="separate-pd" class="text-sm text-gray-700">Jag har olika PD höger/vänster</label>
      </div>
      <div v-if="!form.separatePd" class="grid grid-cols-1 gap-4">
        <select v-model="form.pd" class="rounded border border-gray-300 px-3 py-2 text-gray-900">
          <option v-for="opt in pdOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div v-else class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-xs text-gray-500">Höger</label>
          <select v-model="form.pdRight" class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900">
            <option v-for="opt in pdOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">Vänster</label>
          <select v-model="form.pdLeft" class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900">
            <option v-for="opt in pdOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Attestation: correct strengths entered -->
    <div class="mb-6 flex items-start gap-3">
      <input
        id="receipt-age"
        v-model="form.receiptNotOlderThanOneYear"
        type="checkbox"
        class="mt-1 h-4 w-4 rounded border-gray-300"
      />
      <label for="receipt-age" class="text-sm text-gray-700">
        jag intygar att jag skrivit in rätt styrkor
      </label>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        :disabled="!canSubmit"
        class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
