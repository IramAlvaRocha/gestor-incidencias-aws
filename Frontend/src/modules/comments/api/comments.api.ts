import { apiClient } from '@/shared/api/axios';
import type { Comment, CreateCommentPayload } from '../types/comment.types';

export const getComments = async (ticketId: string): Promise<Comment[]> => {
  const { data } = await apiClient.get<Comment[]>(`/tickets/${ticketId}/comments`);
  return data;
};

export const createComment = async (
  ticketId: string,
  payload: CreateCommentPayload
): Promise<Comment> => {
  const { data } = await apiClient.post<Comment>(`/tickets/${ticketId}/comments`, payload);
  return data;
};