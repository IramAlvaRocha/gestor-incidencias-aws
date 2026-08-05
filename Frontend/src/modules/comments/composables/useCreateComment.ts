import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createComment } from '../api/comments.api';
import { commentKeys } from '../api/comments.key';
import type { CreateCommentPayload } from '../types/comment.types';

export const useCreateComment = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => createComment(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTicket(ticketId) });
    },
  });
};