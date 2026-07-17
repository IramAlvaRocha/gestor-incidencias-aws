import { z } from 'zod';

export const registrarUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('El email no es válido'),
  password: z.string().min(6, 'El password debe tener al menos 6 caracteres'),
  rol: z.enum(['Admin', 'Developer', 'Reporter']).optional(),
});