<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed } from 'vue';
import { z } from 'zod';
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
import { useCreateTicket } from '../composables/useCreateTicket';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<{ success: [] }>();

const ticketSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().min(20, 'Mínimo 20 caracteres'),
  type: z.enum(['Bug', 'Task', 'Story', 'Improvement']),
  priority: z.enum(['Low', 'Medium', 'High']),
});

const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(ticketSchema),
  initialValues: {
    title: '',
    description: '',
    type: 'Task' as const,
    priority: 'Medium' as const,
  },
});

const [title] = defineField('title');
const [description] = defineField('description');
const [type] = defineField('type');
const [priority] = defineField('priority');

const { mutate: doCreateTicket, isPending, error: apiError, isError } =
  useCreateTicket();

const apiErrorMessage = computed(() => {
  const err = apiError.value as any;
  if (!err) return null;

  const data = err.response?.data;
  if (typeof data?.error === 'string') return data.error;

  const fieldErrors = data?.errors;
  if (fieldErrors && typeof fieldErrors === 'object') {
    const first = Object.values(fieldErrors).flat()[0];
    if (typeof first === 'string') return first;
  }

  return err.message ?? 'Error al crear el ticket';
});

const onSubmit = handleSubmit((values) => {
  if (!props.projectId) {
    console.error('TicketForm: projectId is missing');
    return;
  }

  doCreateTicket(
    {
      title: values.title,
      description: values.description,
      type: values.type,
      priority: values.priority,
      projectId: props.projectId,
    },
    {
      onSuccess: () => {
        resetForm({
          values: {
            title: '',
            description: '',
            type: 'Task',
            priority: 'Medium',
          },
        });
        emit('success');
      },
      onError: (error) => {
        console.error('Create ticket failed', error);
      },
    },
  );
});
</script>

<template>
  <Card class="border-border/70 border-dashed bg-card/60">
    <CardHeader>
      <CardTitle class="text-lg">Nuevo ticket</CardTitle>
      <CardDescription>
        Describe la incidencia. La descripción debe tener al menos 20 caracteres.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex max-w-xl flex-col gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="ticket-title">Título</Label>
          <Input
            id="ticket-title"
            v-model="title"
            type="text"
            placeholder="No se puede iniciar sesión"
          />
          <p v-if="errors.title" class="text-destructive text-xs">{{ errors.title }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="ticket-description">Descripción</Label>
          <Textarea
            id="ticket-description"
            v-model="description"
            rows="3"
            placeholder="Pasos para reproducir, resultado esperado, etc."
          />
          <p v-if="errors.description" class="text-destructive text-xs">
            {{ errors.description }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="ticket-type">Tipo</Label>
            <select
              id="ticket-type"
              v-model="type"
              class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="Bug">Bug</option>
              <option value="Task">Tarea</option>
              <option value="Story">Historia</option>
              <option value="Improvement">Mejora</option>
            </select>
            <p v-if="errors.type" class="text-destructive text-xs">{{ errors.type }}</p>
          </div>

          <div class="grid gap-2">
            <Label for="ticket-priority">Prioridad</Label>
            <select
              id="ticket-priority"
              v-model="priority"
              class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="Low">Baja</option>
              <option value="Medium">Media</option>
              <option value="High">Alta</option>
            </select>
            <p v-if="errors.priority" class="text-destructive text-xs">
              {{ errors.priority }}
            </p>
          </div>
        </div>

        <p v-if="isError && apiErrorMessage" class="text-destructive text-sm">
          {{ apiErrorMessage }}
        </p>

        <div class="flex justify-end">
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Creando...' : 'Crear ticket' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
