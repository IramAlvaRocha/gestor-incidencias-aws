import { z } from "zod"

export const createTicketSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
    type: z.enum(['Bug', 'Tarea', 'Historia', 'Mejora']).optional(),
    priority: z.enum(['Baja', 'Media', 'Alta']).optional(),
    projectId: z.string().uuid("El projectId debe ser un UUID válido"),
})

export const changeStatusSchema = z.object({
    status: z.enum(['Open', 'In Progress', 'Closed'])
})

export const assignTicketSchema = z.object({
    assigneeId: z.uuidv4()
})