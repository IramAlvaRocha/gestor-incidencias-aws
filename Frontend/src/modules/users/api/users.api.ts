import { apiClient } from "@/shared/api/axios";
import type { Role, User } from "../types/user.types";

interface CreateUserPayload {
    name: string,
    email: string,
    password: string,
    role?: Role;
}

export const createUser = async(payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', payload);
    return data;
}

export const getAllUsers = async(): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
}