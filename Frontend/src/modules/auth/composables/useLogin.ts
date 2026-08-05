import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.store"
import { useMutation } from "@tanstack/vue-query";
import { login } from "../api/auth.api";
import type { LoginCredentials } from "../types/auth.types";

export const useLogin = () => {
    const authStore = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => login(credentials),
        onSuccess: (data) => {
            authStore.setUser(data.user);
            router.push('/');
        }
    })
}