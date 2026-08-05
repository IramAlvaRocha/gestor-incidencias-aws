<template>
  <form @submit="onSubmit" class="flex flex-col gap-4 max-w-sm mx-auto mt-20">
    <h1 class="text-2xl font-bold text-center">Mini-Jira</h1>

    <div>
      <label class="block text-sm font-medium">Email</label>
      <input
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        class="w-full border rounded px-3 py-2"
        placeholder="tu@email.com"
      />
      <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium">Contraseña</label>
      <input
        v-model="password"
        v-bind="passwordAttrs"
        type="password"
        class="w-full border rounded px-3 py-2"
        placeholder="••••••••"
      />
      <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>
    </div>

    <p v-if="apiError" class="text-red-500 text-sm text-center">
      Credenciales incorrectas
    </p>

    <button
      type="submit"
      :disabled="isPending"
      class="bg-blue-600 text-white rounded py-2 disabled:opacity-50"
    >
      {{ isPending ? 'Ingresando...' : 'Ingresar' }}
    </button>
  </form>
</template>




<script setup lang="ts">

import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod";
import { useLogin } from "../composables/useLogin"; 


const loginSchema = z.object({
    email: z.email("El email no es válido"),
    password: z.string().min(1, "La contrasena es requerida")
});

const { mutate: doLogin, isPending, error: apiError } = useLogin();

const { handleSubmit, defineField, errors } = useForm({
    validationSchema: toTypedSchema(loginSchema),
    initialValues: { email: '', password: '' },
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');


const onSubmit = handleSubmit((values)=> {
    doLogin(values);
});

</script>