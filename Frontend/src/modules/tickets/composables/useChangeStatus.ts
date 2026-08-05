import { useMutation, useQueryClient } from "@tanstack/vue-query"
import { changeStatusTicket } from "../api/tickets.api";
import type { TicketStatus } from "../types/ticket.types";
import { ticketKeys } from "../api/tickets.key";

export const useChangeStatus = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, newStatus }: { ticketId: string; newStatus: TicketStatus}) => changeStatusTicket(ticketId, newStatus),
        onSuccess: (ticket) => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) });
            queryClient.invalidateQueries({ queryKey: ticketKeys.list(ticket.projectId) });
        } 
    })
}