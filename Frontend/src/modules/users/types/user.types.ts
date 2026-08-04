export type Rol = 'Admin' | 'Developer' | 'Reporter';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  fechaCreacion: string;
}