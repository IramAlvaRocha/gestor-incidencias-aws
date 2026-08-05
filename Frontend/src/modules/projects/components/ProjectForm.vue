<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '../composables/useCreateProject';

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre del proyecto debe tener al menos 3 caracteres'),
  key: z
    .string()
    .min(2, 'La key debe tener al menos 2 caracteres')
    .max(10, 'La key no debe tener más de 10 caracteres'),
  description: z
    .string()
    .min(5, 'La descripción debe tener mínimo 5 caracteres'),
});

const emit = defineEmits<{ success: [] }>();

const {
  mutate: doCreateProject,
  isPending,
  error: apiError,
} = useCreateProject();

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(formSchema),
});

const [name, nameAttrs] = defineField('name');
const [key, keyAttrs] = defineField('key');
const [description, descriptionAttrs] = defineField('description');

const onSubmit = handleSubmit((values) => {
  doCreateProject(values, {
    onSuccess: () => {
      resetForm();
      emit('success');
    },
  });
});
</script>

<template>
  <Card class="border-border/70 border-dashed bg-card/60">
    <CardHeader>
      <CardTitle class="text-lg">Nuevo proyecto</CardTitle>
      <CardDescription>
        Define un nombre, una key corta y una descripción para tu equipo.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex max-w-xl flex-col gap-4" @submit="onSubmit">
        <div class="grid gap-2">
          <Label for="project-name">Nombre</Label>
          <Input
            id="project-name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            placeholder="Sistema de Incidencias"
          />
          <p v-if="errors.name" class="text-destructive text-xs">{{ errors.name }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="project-key">Key</Label>
          <Input
            id="project-key"
            v-model="key"
            v-bind="keyAttrs"
            type="text"
            class="font-mono uppercase"
            placeholder="PROJ"
          />
          <p v-if="errors.key" class="text-destructive text-xs">{{ errors.key }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="project-description">Descripción</Label>
          <Textarea
            id="project-description"
            v-model="description"
            v-bind="descriptionAttrs"
            rows="3"
            placeholder="¿De qué trata este proyecto?"
          />
          <p v-if="errors.description" class="text-destructive text-xs">
            {{ errors.description }}
          </p>
        </div>

        <p v-if="apiError" class="text-destructive text-sm">
          {{
            (apiError as any)?.response?.data?.error ??
            'Ocurrió un error al crear el proyecto'
          }}
        </p>

        <div class="flex justify-end">
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Creando...' : 'Crear proyecto' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
