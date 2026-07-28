import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["Bug", "Task", "Story", "Improvement"]).default("Task"),
  priority: z.enum(["Low", "Medium", "High"]).default("Low"),
  projectId: z.string().uuid("projectId must be a valid UUID"),
});

export const changeStatusSchema = z.object({
  status: z.enum(["Open", "In Progress", "Closed"]),
});

export const assignTicketSchema = z.object({
  assigneeId: z.uuidv4(),
});
