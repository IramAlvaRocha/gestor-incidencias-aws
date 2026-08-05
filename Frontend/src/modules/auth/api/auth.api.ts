import { apiClient } from "@/shared/api/axios";
import type { AuthUser, LoginCredentials } from "../types/auth.types";

export const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
    const { data } = await apiClient.post<AuthUser>('/auth/login', credentials);
    return data;
}

export const logout = async(): Promise<void> => {
    await apiClient.post("/auth/logout");
}

export const getMe = async(): Promise<{user: AuthUser}> => {
    const { data } = await apiClient.get<{user: AuthUser}>('/auth/me');
    return data;
}