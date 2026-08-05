import { apiClient } from "@/shared/api/axios"
import type { CreateProjectPayload, Project } from "../types/project.types"


export const createProject = async(payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', payload);
    return data;
}


export const getAllProjects = async(): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
}

export const addMember = async(projectId: string, userId: string): Promise<Project> => {
    const { data } = await apiClient.post<Project>(`/projects/${projectId}/members`, { userId } );
    return data;
}


export const getProjectById = async(id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
}