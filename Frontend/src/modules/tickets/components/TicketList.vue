<script setup lang="ts">
import { Plus, Ticket } from '@lucide/vue';
import { ref, toRef } from 'vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTickets } from '../composables/useTickets';
import TicketCard from './TicketCard.vue';
import TicketForm from './TicketForm.vue';

const props = defineProps<{ projectId: string }>();

const showForm = ref(false);
const projectIdRef = toRef(props, 'projectId');
const { data: tickets, isLoading, isError } = useTickets(projectIdRef);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold tracking-tight">Tickets</h2>
        <p class="text-muted-foreground mt-1 text-sm">
          Incidencias y tareas de este proyecto.
        </p>
      </div>
      <Button @click="showForm = !showForm">
        <Plus v-if="!showForm" />
        {{ showForm ? 'Cancelar' : 'Nuevo ticket' }}
      </Button>
    </div>

    <div v-if="showForm" class="animate-in fade-in slide-in-from-top-2 duration-300">
      <TicketForm :project-id="projectId" @success="showForm = false" />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="n in 3" :key="n" class="h-28 rounded-xl" />
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm"
    >
      No se pudieron cargar los tickets.
    </div>

    <template v-else>
      <div
        v-if="tickets?.length"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <TicketCard
          v-for="ticket in tickets"
          :key="ticket.id"
          :ticket="ticket"
        />
      </div>

      <div
        v-else
        class="border-border/70 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center"
      >
        <div
          class="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-xl"
        >
          <Ticket class="size-6" />
        </div>
        <p class="font-medium">Aún no hay tickets</p>
        <p class="text-muted-foreground mt-1 max-w-sm text-sm">
          Crea el primero para empezar a dar seguimiento.
        </p>
        <Button class="mt-5" @click="showForm = true">
          <Plus />
          Crear ticket
        </Button>
      </div>
    </template>
  </div>
</template>
