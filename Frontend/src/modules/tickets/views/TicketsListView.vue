<script setup lang="ts">
import { Ticket } from '@lucide/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const route = useRoute();
const projectId = computed(() => route.params.projectId as string | undefined);
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div>
      <h2 class="text-2xl font-semibold tracking-tight">Tickets</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        <template v-if="projectId">
          Tickets del proyecto seleccionado.
        </template>
        <template v-else>
          Vista global de incidencias (próximamente).
        </template>
      </p>
    </div>

    <Card class="border-border/70 border-dashed">
      <CardHeader class="items-center py-16 text-center">
        <div
          class="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-xl"
        >
          <Ticket class="size-6" />
        </div>
        <CardTitle class="text-lg">Tablero en construcción</CardTitle>
        <CardDescription class="max-w-md">
          Aquí verás el listado y el kanban de tickets. Esta vista se completa en
          la siguiente fase.
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
</template>
