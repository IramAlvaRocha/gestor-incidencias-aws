export type ActivityAction =
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED';

export interface ActivityLogEntry {
  action: ActivityAction;
  userId: string;
  detail: string;
  timestamp: string;
}

export interface IActivityLogger {
    log(ticketId: string, entry: Omit<ActivityLogEntry, "timestamp">): Promise<void>;
    getByTicketId(ticketId: string): Promise<ActivityLogEntry[]>;
}