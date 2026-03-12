<script setup>
import { ref, computed, watch } from 'vue';

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

// Sphere and cylinder default 0.00 so lists open with 0 visible
const form = ref({
  right: { sphere: '0.00', cylinder: '0.00', axis: '', add: '' },
  left: { sphere: '0.00', cylinder: '0.00', axis: '', add: '' },
  pd: '',
  pdRight: '',
  pdLeft: '',
  separatePd: false,
  hasPrism: false,
  // Prism fields – extend with actual options (e.g. amount, base direction) later
  prism: { right: {}, left: {} },
  receiptNotOlderThanOneYear: false
});

const canSubmit = computed(() => {
  const r = form.value.right;
  const l = form.value.left;
  const hasSphere = r.sphere !== '' || l.sphere !== '';
  const hasPd = form.value.separatePd
    ? (form.value.pdRight !== '' && form.value.pdLeft !== '')
    : form.value.pd !== '';
  return hasSphere && hasPd && form.value.receiptNotOlderThanOneYear;
});

// Reading power = Sphere + ADD (calculated, for reference)
const readingPower = computed(() => {
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
  const manual = {
    right: { ...form.value.right },
    left: { ...form.value.left },
    pd: form.value.separatePd ? { right: form.value.pdRight, left: form.value.pdLeft } : form.value.pd,
    receiptNotOlderThanOneYear: form.value.receiptNotOlderThanOneYear
  };
  if (form.value.hasPrism) {
    manual.prism = { ...form.value.prism };
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
    <p class="mb-6 text-center text-sm text-gray-600">
      Fyll i ditt glasögonrecept. Det är inte alla recept som har cylinder och axel – lämna dessa tomma om de inte finns.
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

    <!-- Addition -->
    <div class="mb-4">
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

    <!-- Reading power (Sphere + ADD), calculated -->
    <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
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

    <!-- Prism: show extra options only when user checks the box -->
    <div class="mb-6">
      <div class="flex items-center gap-2">
        <input
          id="has-prism"
          v-model="form.hasPrism"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300"
        />
        <label for="has-prism" class="text-sm font-medium text-gray-700">Jag har prisma på mitt recept</label>
      </div>
      <div v-if="form.hasPrism" class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p class="mb-3 text-sm font-medium text-gray-700">Prisma – höger och vänster öga</p>
        <p class="mb-4 text-xs text-gray-500">
          Fält för prisma kommer att läggas till här (t.ex. styrka och basriktning).
        </p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs text-gray-600">Höger öga (OD)</label>
            <div class="rounded border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-400">
              Placeholder – lägg till prisma-fält senare
            </div>
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-600">Vänster öga (OS)</label>
            <div class="rounded border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-400">
              Placeholder – lägg till prisma-fält senare
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Guarantee that the receipt is not older than one year -->
    <div class="mb-6 flex items-start gap-3">
      <input
        id="receipt-age"
        v-model="form.receiptNotOlderThanOneYear"
        type="checkbox"
        class="mt-1 h-4 w-4 rounded border-gray-300"
      />
      <label for="receipt-age" class="text-sm text-gray-700">
        Jag intygar att mitt recept inte är äldre än ett år.
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
