import { useQuery } from "@tanstack/vue-query"
import { userKeys } from "../api/users.keys"
import { getAllUsers } from "../api/users.api"

export const useUser = () => {
    return useQuery({
        queryKey: userKeys.list(),
        queryFn: getAllUsers
    })
}