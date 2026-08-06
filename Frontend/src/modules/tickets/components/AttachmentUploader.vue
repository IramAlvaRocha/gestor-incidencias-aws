<script setup lang="ts">
import { FileUp, LoaderCircle } from '@lucide/vue';
import { computed, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { useUploadAttachment } from '../composables/useUploadAttachment';

const props = defineProps<{
  ticketId: string;
}>();

const fileInput = ref<HTMLInputElement>();
const { isPending, error, isError, mutate: doUpload } =
  useUploadAttachment(props.ticketId);

const errorMessage = computed(() => {
  const err = error.value as any;
  if (!err) return null;

  const data = err.response?.data;
  if (typeof data?.error === 'string') return data.error;

  const fieldErrors = data?.errors;
  if (fieldErrors && typeof fieldErrors === 'object') {
    if (fieldErrors.contentType?.length) {
      return 'Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, GIF o PDF.';
    }
    const first = Object.values(fieldErrors).flat()[0];
    if (typeof first === 'string') return first;
  }

  // Evita el mensaje genérico de Axios ("Request failed with status code 400")
  if (typeof err.message === 'string' && !err.message.startsWith('Request failed')) {
    return err.message;
  }

  return 'Error al subir el archivo';
});

const openPicker = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  doUpload(file, {
    onSuccess: () => {
      if (fileInput.value) fileInput.value.value = '';
    },
  });
};
</script>

<template>
  <div class="space-y-2">
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/gif,application/pdf"
      class="hidden"
      :disabled="isPending"
      @change="handleFileChange"
    />

    <button
      type="button"
      class="border-border/70 hover:border-primary/40 hover:bg-muted/40 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors disabled:opacity-50"
      :disabled="isPending"
      @click="openPicker"
    >
      <div
        class="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg"
      >
        <LoaderCircle v-if="isPending" class="size-4 animate-spin" />
        <FileUp v-else class="size-4" />
      </div>
      <div>
        <p class="text-sm font-medium">
          {{ isPending ? 'Subiendo archivo...' : 'Subir adjunto' }}
        </p>
        <p class="text-muted-foreground mt-0.5 text-[11px]">
          PNG, JPG, GIF o PDF · máx. 5 MB
        </p>
      </div>
      <Button
        type="button"
        size="xs"
        variant="secondary"
        class="pointer-events-none mt-1"
        :disabled="isPending"
      >
        Elegir archivo
      </Button>
    </button>

    <p v-if="isError && errorMessage" class="text-destructive text-xs">
      {{ errorMessage }}
    </p>
  </div>
</template>
