import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('El email no es válido'),
  password: z.string().min(6, 'El password debe tener al menos 6 caracteres'),
  role: z.enum(['Admin', 'Developer', 'Reporter']).optional(),
});