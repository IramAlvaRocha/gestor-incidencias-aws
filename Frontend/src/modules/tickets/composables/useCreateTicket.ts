import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createTicket } from '../api/tickets.api';
import { ticketKeys } from '../api/tickets.key';
import type { CreateTicketPayload } from '../types/ticket.types';

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: (_ticket, variables: CreateTicketPayload) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.list(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};