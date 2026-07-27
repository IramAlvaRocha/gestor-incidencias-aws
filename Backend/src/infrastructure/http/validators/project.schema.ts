import z from "zod";

export const crearProjectSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos tres caracteres"),
    key: z.string().min(2).max(10, "El key debe tener entre dos y diez caracteres"),
    descripcion: z.string().min(5, "La descripción debe tener al menos cinco caracteres")
});

export const agregarMiembroSchema = z.object({
    userId: z.uuid("El userId debe ser un UUID válido")
});