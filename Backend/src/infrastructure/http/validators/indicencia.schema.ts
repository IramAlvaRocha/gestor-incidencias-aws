import { z } from "zod"

export const crearIncidenciaSchema = z.object({
    titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
    prioridad: z.enum(['Baja', 'Media', 'Alta']).optional()
})