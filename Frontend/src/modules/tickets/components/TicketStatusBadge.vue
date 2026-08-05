<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from '../types/ticket.types';

const props = defineProps<{ status: TicketStatus }>();

const label = computed(() => {
  const map: Record<TicketStatus, string> = {
    Open: 'Abierto',
    InProgress: 'En progreso',
    Closed: 'Cerrado',
  };
  return map[props.status];
});

const variant = computed(() => {
  const map: Record<TicketStatus, 'default' | 'secondary' | 'outline'> = {
    Open: 'default',
    InProgress: 'secondary',
    Closed: 'outline',
  };
  return map[props.status];
});
</script>

<template>
  <Badge :variant="variant" class="text-[10px] tracking-wide uppercase">
    {{ label }}
  </Badge>
</template>
