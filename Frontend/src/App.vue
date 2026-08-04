<script setup lang="ts">
import { onMounted } from "vue";
import { login } from "./modules/auth/api/auth.api";

onMounted(async () => {
  try {
    const result = await login({email: "admin@ejemplo.com", password: "tu-password" });
    console.log("Login exitoso: ",{ result })
  } catch (error) {
    console.log(error);
    
  }
})

</script>

<template>
  <h1>
    Hola mundo
  </h1>
</template>
