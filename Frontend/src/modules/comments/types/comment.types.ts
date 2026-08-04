export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
}