export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (projectId?: string) => [...ticketKeys.lists(), projectId ?? 'all'] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
};