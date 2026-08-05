import { useMutation } from '@tanstack/vue-query';
import { logout } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "vue-router";

export const useLogout = () => {

    const authStore = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            authStore.clearUser();
            router.push("/login")
        }
    })
}