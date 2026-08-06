export const attachmentKeys = {
    byTicket: (ticketId: string) => ["attachments", ticketId] as const,
}