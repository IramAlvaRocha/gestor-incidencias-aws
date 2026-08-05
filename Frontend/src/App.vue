<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getMe } from './modules/auth/api/auth.api';
import { useAuthStore } from './modules/auth/store/auth.store';

const { setUser } = useAuthStore();
const isCheckingSession = ref(true);

onMounted(async () => {
  try {
    const { user } = await getMe();
    setUser(user);
  } catch {
    // Sin sesión válida
  } finally {
    isCheckingSession.value = false;
  }
});
</script>

<template>
  <div
    v-if="isCheckingSession"
    class="bg-background flex min-h-svh flex-col items-center justify-center gap-3"
  >
    <div
      class="border-primary size-9 animate-spin rounded-full border-2 border-t-transparent"
    />
    <p class="text-muted-foreground text-sm">Preparando tu espacio...</p>
  </div>

  <RouterView v-else />
</template>
