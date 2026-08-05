export const commentKeys = {
    all: ['comments'] as const,
    byTicket: (ticketId: string) => [...commentKeys.all, ticketId] as const,
  };