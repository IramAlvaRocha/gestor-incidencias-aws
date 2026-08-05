import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { getTickets } from '../api/tickets.api';
import { ticketKeys } from '../api/tickets.key';

export const useTickets = (projectId: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => ticketKeys.list(toValue(projectId))),
    queryFn: () => getTickets(toValue(projectId)),
  });
};
