import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).default(0),
  parentId: z.string().cuid().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
