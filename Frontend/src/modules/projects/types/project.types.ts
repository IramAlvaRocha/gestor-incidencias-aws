export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description: string;
}