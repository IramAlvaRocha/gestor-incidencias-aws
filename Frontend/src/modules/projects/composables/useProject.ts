import { useQuery } from "@tanstack/vue-query"
import { projectKeys } from "../api/projects.keys"
import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { getProjectById } from "../api/projects.api"

export const useProject = (projectId: MaybeRefOrGetter<string>) => {
    return useQuery({
        queryKey: computed(() => projectKeys.detail(toValue(projectId))),
        queryFn: () => getProjectById(toValue(projectId)),
    })
}