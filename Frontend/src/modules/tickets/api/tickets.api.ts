import { apiClient } from "@/shared/api/axios";
import type { CreateTicketPayload, Ticket, TicketStatus } from "../types/ticket.types";

export const createTicket = async(payload: CreateTicketPayload) : Promise<Ticket> => {
    const { data } = await apiClient.post<Ticket>('/tickets', payload);
    return data;
}

export const getAllTickets = async(): Promise<Ticket[]> => {
    const { data } = await apiClient.get<Ticket[]>('/tickets');
    return data;
}

export const assignTicket = async(ticketId: string, assigneeId: string): Promise<Ticket> => {
    const { data } = await apiClient.post<Ticket>(`/tickets/${ticketId}/assign`, { assigneeId })
    return data;
}

export const changeStatusTicket = async(ticketId: string, newStatus: TicketStatus): Promise<Ticket> => {
    const { data } = await apiClient.post<Ticket>(`/tickets/${ticketId}/status`, { newStatus });
    return data;
}