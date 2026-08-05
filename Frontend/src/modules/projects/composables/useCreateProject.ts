import { useQueryClient, useMutation } from "@tanstack/vue-query"
import { createProject } from "../api/projects.api"
import { projectKeys } from "../api/projects.keys";

export const useCreateProject = () => {
    
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        }
    })
}