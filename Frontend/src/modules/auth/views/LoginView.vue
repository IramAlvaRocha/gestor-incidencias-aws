<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue';
</script>

<template>
  <div class="login-atmosphere relative flex min-h-svh items-center justify-center overflow-hidden p-4">
    <div class="login-grid pointer-events-none absolute inset-0 opacity-60" />
    <div
      class="pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
    />
    <LoginForm class="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500" />
  </div>
</template>
