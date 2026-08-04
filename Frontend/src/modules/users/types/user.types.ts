export type Role = 'Admin' | 'Developer' | 'Reporter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}