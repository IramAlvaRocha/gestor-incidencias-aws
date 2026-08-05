<script setup lang="ts">
import { Label } from '@/components/ui/label';
import { useChangeStatus } from '../composables/useChangeStatus';
import type { Ticket, TicketStatus } from '../types/ticket.types';

const props = defineProps<{ ticket: Ticket }>();
const { mutate: doChangeStatus, isPending, error } = useChangeStatus();

const statuses: { value: TicketStatus; label: string }[] = [
  { value: 'Open', label: 'Abierto' },
  { value: 'InProgress', label: 'En progreso' },
  { value: 'Closed', label: 'Cerrado' },
];

const handleChange = (event: Event) => {
  const status = (event.target as HTMLSelectElement).value as TicketStatus;
  doChangeStatus({ ticketId: props.ticket.id, newStatus: status });
};
</script>

<template>
  <div class="grid gap-1.5">
    <Label for="ticket-status" class="text-muted-foreground text-xs">Estado</Label>
    <select
      id="ticket-status"
      :value="ticket.status"
      class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm disabled:opacity-50"
      :disabled="isPending"
      @change="handleChange"
    >
      <option v-for="status in statuses" :key="status.value" :value="status.value">
        {{ status.label }}
      </option>
    </select>
    <p v-if="error" class="text-destructive text-xs">
      {{ (error as any)?.response?.data?.error ?? 'No se pudo cambiar el estado' }}
    </p>
  </div>
</template>
