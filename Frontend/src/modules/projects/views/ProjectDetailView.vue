<script setup lang="ts">
import { toRef } from 'vue';
import { useRoute } from 'vue-router';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import TicketList from '@/modules/tickets/components/TicketList.vue';
import { useProject } from '../composables/useProject';

const route = useRoute();
const projectId = toRef(() => route.params.projectId as string);

const { data: project, isLoading, isError } = useProject(projectId);
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <div v-if="isLoading" class="space-y-3">
      <Skeleton class="h-5 w-20" />
      <Skeleton class="h-8 w-64" />
      <Skeleton class="h-4 w-96 max-w-full" />
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm"
    >
      No se pudo cargar el proyecto.
    </div>

    <template v-else-if="project">
      <div>
        <Badge variant="secondary" class="font-mono text-[10px] tracking-wider uppercase">
          {{ project.key }}
        </Badge>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight">{{ project.name }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">{{ project.description }}</p>
      </div>

      <TicketList :project-id="project.id" />
    </template>
  </div>
</template>
