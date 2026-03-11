<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

const ACCEPT = '.png,.jpg,.jpeg,.pdf';
const MAX_SIZE_MB = 10;

const fileInput = ref(null);
const selectedFile = ref(null);
const error = ref('');

const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function onFileChange(event) {
  error.value = '';
  selectedFile.value = null;
  const file = event.target?.files?.[0];
  if (!file) return;

  if (!acceptedTypes.includes(file.type)) {
    error.value = 'Endast PNG, JPG och PDF är tillåtna.';
    event.target.value = '';
    return;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    error.value = `Filen får max vara ${MAX_SIZE_MB} MB.`;
    event.target.value = '';
    return;
  }
  selectedFile.value = file;
  event.target.value = '';
}

function triggerInput() {
  fileInput.value?.click();
}

function removeFile() {
  selectedFile.value = null;
  error.value = '';
}

function submit() {
  if (!selectedFile.value) return;
  const file = selectedFile.value;
  const reader = new FileReader();
  reader.onload = () => {
    emit('submit', {
      title: 'Ladda upp recept',
      type: 'upload',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      dataUrl: reader.result
    });
  };
  reader.readAsDataURL(file);
}

function cancel() {
  emit('cancel');
}

const canSubmit = computed(() => !!selectedFile.value);
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-center text-lg font-semibold text-gray-900">
      Ladda upp recept
    </h3>
    <p class="mb-6 text-center text-sm text-gray-600">
      Välj en bild (PNG eller JPG) eller en PDF-fil av ditt recept.
    </p>

    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPT"
      class="hidden"
      @change="onFileChange"
    />

    <div
      v-if="!selectedFile"
      class="mb-6 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-gray-400 hover:bg-gray-100"
      @click="triggerInput"
    >
      <span class="text-sm font-medium text-gray-600">Klicka för att välja fil</span>
      <span class="mt-1 text-xs text-gray-500">PNG, JPG eller PDF (max {{ MAX_SIZE_MB }} MB)</span>
    </div>

    <div
      v-else
      class="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
    >
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-gray-900">{{ selectedFile.name }}</p>
        <p class="text-xs text-gray-500">{{ formatSize(selectedFile.size) }}</p>
      </div>
      <div class="ml-3 flex gap-2">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click.stop="triggerInput"
        >
          Byt fil
        </button>
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click.stop="removeFile"
        >
          Ta bort
        </button>
      </div>
    </div>

    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>

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
