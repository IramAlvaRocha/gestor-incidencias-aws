<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from './modules/auth/store/auth.store';
import { getMe } from './modules/auth/api/auth.api';

const { setUser } = useAuthStore();
const isCheckingSession = ref(true);

onMounted(async() => {
  try {
    const { user } = await getMe();
    setUser(user);
  } catch (error) {
    //No hay una session valida
  }
  finally {
    isCheckingSession.value = false;
  }
})
</script>

<template>

  <div v-if="isCheckingSession" class="flex items-center justify-center h-screen">
    Cargando ...
  </div>

  <router-view v-else/>
</template>
