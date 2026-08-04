import { apiClient } from "@/shared/api/axios";
import type { AuthResponse, LoginCredentials } from "../types/auth.types";

export const login = async(credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data; 
}