import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { getComments } from '../api/comments.api';
import { commentKeys } from '../api/comments.key';

export const useComments = (ticketId: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => commentKeys.byTicket(toValue(ticketId))),
    queryFn: () => getComments(toValue(ticketId)),
  });
};