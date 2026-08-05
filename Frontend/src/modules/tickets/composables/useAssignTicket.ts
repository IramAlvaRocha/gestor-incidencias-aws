import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { assignTicket } from '../api/tickets.api';
import { ticketKeys } from '../api/tickets.key';

export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string }) =>
      assignTicket(ticketId, assigneeId),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.list(ticket.projectId) });
    },
  });
};