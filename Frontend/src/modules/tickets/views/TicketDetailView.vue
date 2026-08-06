<script setup lang="ts">
import { ArrowLeft, Calendar, Flag, Layers } from '@lucide/vue';
import { computed, toRef } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import CommentList from '@/modules/comments/components/CommentList.vue';
import { useProject } from '@/modules/projects/composables/useProject';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import AsigneeSelect from '../components/AsigneeSelect.vue';
import AttachmentList from '../components/AttachmentList.vue';
import TicketStatusBadge from '../components/TicketStatusBadge.vue';
import TicketStatusSelect from '../components/TicketStatusSelect.vue';
import { useTicket } from '../composables/useTicket';
import type { Priority, TicketType } from '../types/ticket.types';

const route = useRoute();
const ticketId = toRef(() => route.params.id as string);

const { data: ticket, isLoading, isError } = useTicket(ticketId);
const projectId = toRef(() => ticket.value?.projectId ?? '');
const { data: project } = useProject(projectId);

const typeLabel = computed(() => {
  if (!ticket.value) return '';
  const map: Record<TicketType, string> = {
    Bug: 'Bug',
    Task: 'Tarea',
    Story: 'Historia',
    Improvement: 'Mejora',
  };
  return map[ticket.value.type];
});

const priorityLabel = computed(() => {
  if (!ticket.value) return '';
  const map: Record<Priority, string> = {
    Low: 'Baja',
    Medium: 'Media',
    High: 'Alta',
  };
  return map[ticket.value.priority];
});

const createdAtLabel = computed(() => {
  if (!ticket.value?.createdAt) return '—';
  return new Date(ticket.value.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div class="flex items-center gap-2">
      <Button
        v-if="ticket?.projectId"
        variant="ghost"
        size="sm"
        as-child
      >
        <RouterLink
          :to="{
            name: 'project-detail',
            params: { projectId: ticket.projectId },
          }"
        >
          <ArrowLeft />
          Volver al proyecto
        </RouterLink>
      </Button>
    </div>

    <div v-if="isLoading" class="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Card class="border-border/70">
        <CardHeader class="gap-3">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-8 w-3/4" />
          <Skeleton class="h-20 w-full" />
        </CardHeader>
      </Card>
      <Card class="border-border/70">
        <CardContent class="space-y-4 pt-6">
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
        </CardContent>
      </Card>
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm"
    >
      No se pudo cargar el ticket.
    </div>

    <div v-else-if="ticket" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card class="border-border/70 overflow-hidden">
        <CardHeader class="gap-4 border-b border-border/60 bg-muted/20">
          <div class="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              class="font-mono text-[10px] tracking-wider uppercase"
            >
              {{ ticket.key }}
            </Badge>
            <TicketStatusBadge :status="ticket.status" />
            <Badge v-if="project" variant="outline" class="text-[10px]">
              {{ project.key }}
            </Badge>
          </div>

          <div>
            <CardTitle class="text-2xl leading-tight font-semibold tracking-tight">
              {{ ticket.title }}
            </CardTitle>
            <CardDescription v-if="project" class="mt-1">
              En {{ project.name }}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent class="space-y-6 pt-6">
          <section>
            <h2 class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Descripción
            </h2>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {{ ticket.description }}
            </p>
          </section>

          <Separator />

          <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="bg-muted/30 flex items-start gap-3 rounded-xl border border-border/50 p-3">
              <div class="bg-background text-muted-foreground flex size-8 items-center justify-center rounded-lg border">
                <Layers class="size-4" />
              </div>
              <div>
                <p class="text-muted-foreground text-[11px] uppercase">Tipo</p>
                <p class="text-sm font-medium">{{ typeLabel }}</p>
              </div>
            </div>

            <div class="bg-muted/30 flex items-start gap-3 rounded-xl border border-border/50 p-3">
              <div class="bg-background text-muted-foreground flex size-8 items-center justify-center rounded-lg border">
                <Flag class="size-4" />
              </div>
              <div>
                <p class="text-muted-foreground text-[11px] uppercase">Prioridad</p>
                <p class="text-sm font-medium">{{ priorityLabel }}</p>
              </div>
            </div>

            <div class="bg-muted/30 flex items-start gap-3 rounded-xl border border-border/50 p-3">
              <div class="bg-background text-muted-foreground flex size-8 items-center justify-center rounded-lg border">
                <Calendar class="size-4" />
              </div>
              <div>
                <p class="text-muted-foreground text-[11px] uppercase">Creado</p>
                <p class="text-sm font-medium">{{ createdAtLabel }}</p>
              </div>
            </div>
          </section>

          <Separator />

          <CommentList :ticket-id="ticket.id" />
        </CardContent>
      </Card>

      <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card class="border-border/70">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-semibold">Detalles</CardTitle>
            <CardDescription class="text-xs">
              Actualiza el estado y el responsable.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <TicketStatusSelect :ticket="ticket" />
            <AsigneeSelect
              v-if="project"
              :ticket="ticket"
              :member-ids="project.members"
            />
            <p v-else class="text-muted-foreground text-xs">
              Cargando miembros del proyecto...
            </p>
          </CardContent>
        </Card>

        <Card class="border-border/70">
          <CardContent class="pt-5">
            <AttachmentList :ticket-id="ticket.id" />
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
</template>
