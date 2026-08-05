<script setup lang="ts">
import { MessageSquare } from '@lucide/vue';
import { toRef } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import { useComments } from '../composables/useComments';
import CommentForm from './CommentForm.vue';
import CommentItem from './CommentItem.vue';

const props = defineProps<{ ticketId: string }>();
const ticketIdRef = toRef(props, 'ticketId');

const { data: comments, isLoading, isError } = useComments(ticketIdRef);
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center gap-2">
      <div
        class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
      >
        <MessageSquare class="size-4" />
      </div>
      <div>
        <h3 class="text-sm font-semibold">Comentarios</h3>
        <p class="text-muted-foreground text-xs">
          {{ comments?.length ?? 0 }} en esta conversación
        </p>
      </div>
    </div>

    <div class="bg-card/40 rounded-xl border border-border/60 p-4">
      <CommentForm :ticket-id="ticketId" />
    </div>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="n in 2" :key="n" class="h-20 rounded-xl" />
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
    >
      No se pudieron cargar los comentarios.
    </div>

    <div
      v-else-if="comments?.length === 0"
      class="border-border/60 text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm"
    >
      Aún no hay comentarios. ¡Sé el primero!
    </div>

    <div v-else class="space-y-3">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
      />
    </div>
  </section>
</template>
