<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed } from 'vue';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '../composables/useCreateComment';

const props = defineProps<{ ticketId: string }>();

const commentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío'),
});

const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(commentSchema),
  initialValues: { content: '' },
});

const [content] = defineField('content');

const { mutate: doCreateComment, isPending, error: apiError, isError } =
  useCreateComment(props.ticketId);

const apiErrorMessage = computed(() => {
  const err = apiError.value as any;
  if (!err) return null;
  return err.response?.data?.error ?? err.message ?? 'Error al comentar';
});

const onSubmit = handleSubmit((values) => {
  doCreateComment(values, {
    onSuccess: () => resetForm({ values: { content: '' } }),
  });
});
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
    <div class="grid gap-1.5">
      <Label for="comment-content" class="text-muted-foreground text-xs">
        Nuevo comentario
      </Label>
      <Textarea
        id="comment-content"
        v-model="content"
        rows="3"
        placeholder="Escribe un comentario..."
        class="min-h-20"
      />
      <p v-if="errors.content" class="text-destructive text-xs">
        {{ errors.content }}
      </p>
      <p v-if="isError && apiErrorMessage" class="text-destructive text-xs">
        {{ apiErrorMessage }}
      </p>
    </div>

    <div class="flex justify-end">
      <Button type="submit" size="sm" :disabled="isPending">
        {{ isPending ? 'Enviando...' : 'Comentar' }}
      </Button>
    </div>
  </form>
</template>
