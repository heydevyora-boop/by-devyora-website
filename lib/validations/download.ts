import { z } from "zod";

export const downloadCategorySchema = z.enum([
  "CATALOGUE",
  "TECHNICAL",
  "BROCHURE",
  "INSTALLATION",
]);

export const createDownloadFileSchema = z.object({
  name: z.string().min(1).max(200),
  category: downloadCategorySchema,
  fileUrl: z.string().url(),
  fileSize: z.number().int().min(1), // bytes
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  published: z.boolean().default(true),
  productId: z.string().cuid().optional(),
});

export const updateDownloadFileSchema = createDownloadFileSchema
  .partial()
  .extend({ id: z.string().cuid() });

export type CreateDownloadFileInput = z.infer<typeof createDownloadFileSchema>;
export type UpdateDownloadFileInput = z.infer<typeof updateDownloadFileSchema>;
