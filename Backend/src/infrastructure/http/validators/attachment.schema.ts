import z from "zod";

export const requestUploadUrlSchema = z.object({
    fileName: z.string().min(1),
    contentType: z.enum(['image/png', 'image/jpeg', 'image/gif', 'application/pdf']),
})

export const addAttachmentSchema = z.object({
    key: z.string().min(1)
})