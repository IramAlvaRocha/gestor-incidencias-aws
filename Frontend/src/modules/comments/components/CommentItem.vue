<script setup lang="ts">
import { computed } from 'vue';
import { useUser } from '@/modules/users/composables/useUsers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Comment } from '../types/comment.types';

const props = defineProps<{ comment: Comment }>();

const { data: users } = useUser();

const author = computed(() =>
  (users.value ?? []).find((user) => user.id === props.comment.userId),
);

const initials = computed(() => {
  const name = author.value?.name?.trim() ?? '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
});

const createdAtLabel = computed(() =>
  new Date(props.comment.createdAt).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
);
</script>

<template>
  <article class="bg-muted/20 flex gap-3 rounded-xl border border-border/50 p-3">
    <Avatar class="size-8 border border-border/60">
      <AvatarFallback class="bg-primary/15 text-primary text-xs font-semibold">
        {{ initials }}
      </AvatarFallback>
    </Avatar>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p class="text-sm font-medium">
          {{ author?.name ?? 'Usuario' }}
        </p>
        <time class="text-muted-foreground text-[11px]">
          {{ createdAtLabel }}
        </time>
      </div>
      <p class="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
        {{ comment.content }}
      </p>
    </div>
  </article>
</template>
