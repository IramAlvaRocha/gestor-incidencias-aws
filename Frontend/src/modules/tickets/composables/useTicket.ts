import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { ticketKeys } from "../api/tickets.key";
import { getTicketById } from "../api/tickets.api";

export const useTicket = (ticketId: MaybeRefOrGetter) => {
    return useQuery({
        queryKey: computed(()=> ticketKeys.detail(toValue(ticketId))),
        queryFn: () => getTicketById(toValue(ticketId))
    })
}