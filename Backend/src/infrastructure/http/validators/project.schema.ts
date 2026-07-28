import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(3, "Name must be at least three characters"),
    key: z.string().min(2).max(10, "Key must be between two and ten characters"),
    description: z.string().min(5, "Description must be at least five characters")
});

export const addMemberSchema = z.object({
    userId: z.uuid("userId must be a valid UUID")
});
