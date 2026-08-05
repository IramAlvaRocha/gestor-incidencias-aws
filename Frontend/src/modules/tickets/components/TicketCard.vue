<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Ticket } from '../types/ticket.types';
import TicketStatusBadge from './TicketStatusBadge.vue';

defineProps<{
  ticket: Ticket;
  projectKey?: string;
  projectName?: string;
}>();

const priorityLabel: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
};
</script>

<template>
  <RouterLink
    :to="{ name: 'ticket-detail', params: { id: ticket.id } }"
    class="group block outline-none"
  >
    <Card
      class="border-border/70 h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 group-focus-visible:ring-2 group-focus-visible:ring-ring"
    >
      <CardHeader class="gap-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex min-w-0 items-center gap-2">
            <span class="text-muted-foreground font-mono text-xs">{{ ticket.key }}</span>
            <Badge
              v-if="projectKey"
              variant="outline"
              class="font-mono text-[10px] tracking-wider uppercase"
            >
              {{ projectKey }}
            </Badge>
          </div>
          <TicketStatusBadge :status="ticket.status" />
        </div>
        <CardTitle class="line-clamp-2 text-base leading-snug">
          {{ ticket.title }}
        </CardTitle>
        <p v-if="projectName" class="text-muted-foreground truncate text-xs">
          {{ projectName }}
        </p>
      </CardHeader>
      <CardContent>
        <div class="text-muted-foreground flex items-center justify-between text-xs">
          <Badge variant="secondary">{{ ticket.type }}</Badge>
          <span>{{ priorityLabel[ticket.priority] ?? ticket.priority }}</span>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
