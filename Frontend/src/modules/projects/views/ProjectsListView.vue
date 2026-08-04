<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store/auth.store';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.clearSession();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-xl">Bienvenido, {{ authStore.user?.name }} 👋</h1>
    <button @click="logout" class="text-red-500 mt-4 p-2">
      Cerrar sesión
    </button>
  </div>
</template>