<script setup lang="ts">
import { Users } from '@lucide/vue';
import { RouterLink } from 'vue-router';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Project } from '../types/project.types';

defineProps<{ project: Project }>();
</script>

<template>
  <RouterLink
    :to="{ name: 'project-detail', params: { projectId: project.id } }"
    class="group block outline-none"
  >
    <Card
      class="border-border/70 h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 group-focus-visible:ring-2 group-focus-visible:ring-ring"
    >
      <CardHeader class="gap-3">
        <div class="flex items-start justify-between gap-3">
          <CardTitle class="line-clamp-1 text-base leading-snug">
            {{ project.name }}
          </CardTitle>
          <Badge
            variant="secondary"
            class="font-mono text-[10px] tracking-wider uppercase"
          >
            {{ project.key }}
          </Badge>
        </div>
        <CardDescription class="line-clamp-2 min-h-10">
          {{ project.description || 'Sin descripción' }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Users class="size-3.5" />
          <span>{{ project.members.length }} miembro(s)</span>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
