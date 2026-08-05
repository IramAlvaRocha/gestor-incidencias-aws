<script setup lang="ts">
import { LayoutDashboard } from '@lucide/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '../composables/useLogin';

const loginSchema = z.object({
  email: z.email('El email no es válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const { mutate: doLogin, isPending, error: apiError } = useLogin();

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: '', password: '' },
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit((values) => {
  doLogin(values);
});
</script>

<template>
  <Card class="border-border/70 bg-card/90 shadow-2xl shadow-black/40 backdrop-blur-xl">
    <CardHeader class="items-center text-center">
      <div
        class="bg-primary text-primary-foreground mb-3 flex size-12 items-center justify-center rounded-xl shadow-lg shadow-primary/30"
      >
        <LayoutDashboard class="size-6" />
      </div>
      <CardTitle class="text-2xl font-semibold tracking-tight">Arena</CardTitle>
      <CardDescription class="text-sm">
        Gestiona proyectos e incidencias de tu equipo
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="flex flex-col gap-4" @submit="onSubmit">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            autocomplete="email"
            placeholder="tu@empresa.com"
            class="h-10"
          />
          <p v-if="errors.email" class="text-destructive text-xs">{{ errors.email }}</p>
        </div>

        <div class="grid gap-2">
          <Label for="password">Contraseña</Label>
          <Input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="h-10"
          />
          <p v-if="errors.password" class="text-destructive text-xs">
            {{ errors.password }}
          </p>
        </div>

        <p v-if="apiError" class="text-destructive text-center text-sm">
          Credenciales incorrectas
        </p>

        <Button type="submit" class="h-10 w-full font-semibold" :disabled="isPending">
          {{ isPending ? 'Ingresando...' : 'Ingresar' }}
        </Button>
      </form>
    </CardContent>

    <CardFooter class="justify-center">
      <p class="text-muted-foreground text-xs">
        Acceso seguro · sesión con cookie HttpOnly
      </p>
    </CardFooter>
  </Card>
</template>
