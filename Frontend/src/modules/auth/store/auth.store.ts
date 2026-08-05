import { defineStore } from "pinia"
import { computed, ref } from "vue";
import type { AuthUser } from "../types/auth.types";

export const useAuthStore = defineStore('auth', () => {

    const user = ref<AuthUser | null>(null);
    const isAuthenticated = computed(()=> !!user.value)

    function setUser(newUser: AuthUser): void {
        user.value = newUser;
    }

    function clearUser():void {
        user.value = null;
    }

    return { user, isAuthenticated, setUser, clearUser }

});