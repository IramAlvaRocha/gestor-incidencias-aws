import { useQuery } from "@tanstack/vue-query"
import { projectKeys } from "../api/projects.keys"
import { getAllProjects } from "../api/projects.api"

export const useProject = () => {
    return useQuery({
        queryKey: projectKeys.lists(),
        queryFn: getAllProjects,
    })
}