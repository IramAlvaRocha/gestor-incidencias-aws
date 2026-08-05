<script setup lang="ts">
import { computed } from 'vue';
import { Label } from '@/components/ui/label';
import { useUser } from '@/modules/users/composables/useUsers';
import { useAssignTicket } from '../composables/useAssignTicket';
import type { Ticket } from '../types/ticket.types';

const props = defineProps<{ ticket: Ticket; memberIds: string[] }>();
const { mutate: doAssign, isPending, error } = useAssignTicket();
const { data: users } = useUser();

const members = computed(() =>
  (users.value ?? []).filter((user) => props.memberIds.includes(user.id)),
);

const handleChange = (event: Event) => {
  const assigneeId = (event.target as HTMLSelectElement).value;
  if (!assigneeId) return;
  doAssign({ ticketId: props.ticket.id, assigneeId });
};
</script>

<template>
  <div class="grid gap-1.5">
    <Label for="ticket-assignee" class="text-muted-foreground text-xs">
      Asignado a
    </Label>
    <select
      id="ticket-assignee"
      :value="ticket.assigneeId ?? ''"
      class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm disabled:opacity-50"
      :disabled="isPending"
      @change="handleChange"
    >
      <option value="" disabled>Sin asignar</option>
      <option v-for="member in members" :key="member.id" :value="member.id">
        {{ member.name }}
      </option>
    </select>
    <p v-if="error" class="text-destructive text-xs">
      {{ (error as any)?.response?.data?.error ?? 'No se pudo asignar' }}
    </p>
  </div>
</template>
