<script setup lang="ts">
import { Inbox, Ticket as TicketIcon } from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { useProject } from '@/modules/projects/composables/useProjects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TicketCard from '../components/TicketCard.vue';
import { useTickets } from '../composables/useTickets';
import type { Priority, TicketStatus } from '../types/ticket.types';

type ScopeFilter = 'all' | 'assigned' | 'reported';

const route = useRoute();
const authStore = useAuthStore();
const { data: tickets, isLoading, isError } = useTickets();
const { data: projects } = useProject();

const scope = ref<ScopeFilter>('assigned');
const statusFilter = ref<TicketStatus | 'all'>('all');
const priorityFilter = ref<Priority | 'all'>('all');
const projectFilter = ref<string>('all');

watch(
  () => route.params.projectId as string | undefined,
  (projectId) => {
    if (projectId) {
      projectFilter.value = projectId;
      scope.value = 'all';
    }
  },
  { immediate: true },
);

const projectMap = computed(() => {
  const map = new Map<string, { key: string; name: string }>();
  for (const project of projects.value ?? []) {
    map.set(project.id, { key: project.key, name: project.name });
  }
  return map;
});

const filteredTickets = computed(() => {
  const userId = authStore.user?.id;
  let list = tickets.value ?? [];

  if (scope.value === 'assigned' && userId) {
    list = list.filter((ticket) => ticket.assigneeId === userId);
  }

  if (scope.value === 'reported' && userId) {
    list = list.filter((ticket) => ticket.reporterId === userId);
  }

  if (statusFilter.value !== 'all') {
    list = list.filter((ticket) => ticket.status === statusFilter.value);
  }

  if (priorityFilter.value !== 'all') {
    list = list.filter((ticket) => ticket.priority === priorityFilter.value);
  }

  if (projectFilter.value !== 'all') {
    list = list.filter((ticket) => ticket.projectId === projectFilter.value);
  }

  return [...list].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
});

const selectClass =
  'border-input bg-background h-9 rounded-md border px-3 text-sm';
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Inbox de tickets</h2>
        <p class="text-muted-foreground mt-1 text-sm">
          Vista global de incidencias de tus proyectos.
        </p>
      </div>
      <Badge variant="secondary" class="text-xs">
        {{ filteredTickets.length }} resultado(s)
      </Badge>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button
        size="sm"
        :variant="scope === 'assigned' ? 'default' : 'outline'"
        @click="scope = 'assigned'"
      >
        Asignados a mí
      </Button>
      <Button
        size="sm"
        :variant="scope === 'reported' ? 'default' : 'outline'"
        @click="scope = 'reported'"
      >
        Reportados por mí
      </Button>
      <Button
        size="sm"
        :variant="scope === 'all' ? 'default' : 'outline'"
        @click="scope = 'all'"
      >
        Todos
      </Button>
    </div>

    <div class="bg-card/40 flex flex-wrap gap-3 rounded-xl border border-border/60 p-3">
      <select v-model="statusFilter" :class="selectClass">
        <option value="all">Todos los estados</option>
        <option value="Open">Abierto</option>
        <option value="InProgress">En progreso</option>
        <option value="Closed">Cerrado</option>
      </select>

      <select v-model="priorityFilter" :class="selectClass">
        <option value="all">Todas las prioridades</option>
        <option value="Low">Baja</option>
        <option value="Medium">Media</option>
        <option value="High">Alta</option>
      </select>

      <select v-model="projectFilter" :class="selectClass">
        <option value="all">Todos los proyectos</option>
        <option
          v-for="project in projects ?? []"
          :key="project.id"
          :value="project.id"
        >
          {{ project.key }} — {{ project.name }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="n in 6" :key="n" class="h-36 rounded-xl" />
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm"
    >
      No se pudieron cargar los tickets.
    </div>

    <template v-else>
      <div
        v-if="filteredTickets.length"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <TicketCard
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          :ticket="ticket"
          :project-key="projectMap.get(ticket.projectId)?.key"
          :project-name="projectMap.get(ticket.projectId)?.name"
        />
      </div>

      <div
        v-else
        class="border-border/70 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center"
      >
        <div
          class="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-xl"
        >
          <Inbox v-if="scope !== 'all'" class="size-6" />
          <TicketIcon v-else class="size-6" />
        </div>
        <p class="font-medium">No hay tickets con estos filtros</p>
        <p class="text-muted-foreground mt-1 max-w-sm text-sm">
          Prueba cambiando el alcance, el estado o el proyecto.
        </p>
      </div>
    </template>
  </div>
</template>
