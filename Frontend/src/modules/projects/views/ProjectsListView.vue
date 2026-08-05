<script setup lang="ts">
import { FolderKanban, Plus } from '@lucide/vue';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectForm from '../components/ProjectForm.vue';
import { useProject } from '../composables/useProjects';

const { data: projects, isLoading, isError } = useProject();
const showForm = ref(false);
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Proyectos</h2>
        <p class="text-muted-foreground mt-1 text-sm">
          Selecciona un proyecto para ver sus tickets e incidencias.
        </p>
      </div>
      <Button @click="showForm = !showForm">
        <Plus v-if="!showForm" />
        {{ showForm ? 'Cancelar' : 'Nuevo proyecto' }}
      </Button>
    </div>

    <div v-if="showForm" class="animate-in fade-in slide-in-from-top-2 duration-300">
      <ProjectForm @success="showForm = false" />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="n in 3" :key="n" class="h-40 rounded-xl" />
    </div>

    <div
      v-else-if="isError"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm"
    >
      No se pudieron cargar los proyectos. Intenta de nuevo.
    </div>

    <template v-else>
      <div
        v-if="projects?.length"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>

      <div
        v-else
        class="border-border/70 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center"
      >
        <div
          class="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-xl"
        >
          <FolderKanban class="size-6" />
        </div>
        <p class="font-medium">Aún no tienes proyectos</p>
        <p class="text-muted-foreground mt-1 max-w-sm text-sm">
          Crea el primero para empezar a organizar incidencias con tu equipo.
        </p>
        <Button class="mt-5" @click="showForm = true">
          <Plus />
          Crear proyecto
        </Button>
      </div>
    </template>
  </div>
</template>
