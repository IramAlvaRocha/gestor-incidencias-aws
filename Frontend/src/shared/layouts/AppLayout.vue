<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div class="flex gap-4">
        <router-link to="/projects" class="font-semibold">Proyectos</router-link>
        <router-link to="/tickets" class="font-semibold">Tickets</router-link>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">
          {{ authStore.user?.name }} ({{ authStore.user?.role }})
        </span>
        <button
          @click="doLogout()"
          :disabled="isPending"
          class="text-red-500 text-sm hover:underline disabled:opacity-50"
        >
          {{ isPending ? 'Saliendo...' : 'Cerrar sesión' }}
        </button>
      </div>
    </nav>

    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLogout } from '@/modules/auth/composables/useLogout';
import { useAuthStore } from '@/modules/auth/store/auth.store';

const authStore = useAuthStore();
const { mutate: doLogout, isPending } = useLogout();




</script>