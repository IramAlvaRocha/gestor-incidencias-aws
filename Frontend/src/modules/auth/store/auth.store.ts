import { defineStore } from "pinia"
import { computed, ref } from "vue";
import type { AuthUser } from "../types/auth.types";

export const useAuthStore = defineStore('auth', () => {

    const token = ref<string|null>(localStorage.getItem("token"));

    const user = ref<AuthUser|null>(JSON.parse(localStorage.getItem('user') ?? 'null'));

    const isAuthenticated = computed(() => !!token.value);

    function setSession(newToken: string, newUser:AuthUser): void {
        token.value = newToken;
        user.value = newUser;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    }

    function clearSession(): void {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return { token, user, isAuthenticated, setSession, clearSession }

});