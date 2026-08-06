<script setup lang="ts">
import { ExternalLink, FileText, Image as ImageIcon, Paperclip } from '@lucide/vue';
import { Skeleton } from '@/components/ui/skeleton';
import { useAttachments } from '../composables/useAttachments';
import AttachmentUploader from './AttachmentUploader.vue';

const props = defineProps<{ ticketId: string }>();
const { data: attachments, isLoading, isError } = useAttachments(props.ticketId);

const fileNameFromKey = (key: string) => {
  const parts = key.split('/');
  const raw = parts[parts.length - 1] ?? key;
  const withoutUuid = raw.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-?/i,
    '',
  );
  return withoutUuid || raw;
};

const isImage = (name: string) => /\.(png|jpe?g|gif|webp)$/i.test(name);
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-2">
      <div
        class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
      >
        <Paperclip class="size-4" />
      </div>
      <div>
        <h3 class="text-sm font-semibold">Adjuntos</h3>
        <p class="text-muted-foreground text-xs">
          {{ attachments?.length ?? 0 }} archivo(s)
        </p>
      </div>
    </div>

    <AttachmentUploader :ticket-id="ticketId" />

    <div v-if="isLoading" class="space-y-2">
      <Skeleton v-for="n in 2" :key="n" class="h-11 rounded-lg" />
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-xs"
    >
      No se pudieron cargar los adjuntos.
    </div>

    <ul v-else-if="attachments?.length" class="space-y-2">
      <li v-for="att in attachments" :key="att.key">
        <a
          :href="att.url"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-muted/20 hover:border-primary/40 hover:bg-muted/40 group flex items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5 transition-colors"
        >
          <div
            class="bg-background text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60"
          >
            <ImageIcon
              v-if="isImage(fileNameFromKey(att.key))"
              class="size-4"
            />
            <FileText v-else class="size-4" />
          </div>
          <span class="min-w-0 flex-1 truncate text-sm font-medium">
            {{ fileNameFromKey(att.key) }}
          </span>
          <ExternalLink
            class="text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </a>
      </li>
    </ul>

    <p
      v-else
      class="border-border/60 text-muted-foreground rounded-xl border border-dashed px-3 py-4 text-center text-xs"
    >
      Sin adjuntos aún.
    </p>
  </section>
</template>
