import { apiClient } from "@/shared/api/axios";
import type { AuthResponse, AuthUser, LoginCredentials } from "../types/auth.types";

export const login = async(credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data; 
}

export const logout = async(): Promise<void> => {
    await apiClient.post("/auth/logout");
}

export const getMe = async(): Promise<{user: AuthUser}> => {
    const { data } = await apiClient.get<{user: AuthUser}>('/auth/me');
    return data;
}