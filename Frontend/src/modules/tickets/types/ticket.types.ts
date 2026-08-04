export type TicketStatus = 'Open' | 'InProgress' | 'Closed';
export type Priority = 'Low' | 'Medium' | 'High';
export type TicketType = 'Bug' | 'Task' | 'Story' | 'Improvement';

export interface Ticket {
  id: string;
  key: string;
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  estado: TicketStatus;
  projectId: string;
  reporterId: string;
  assigneeId: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  type: TicketType;
  priority?: Priority;
  projectId: string;
}