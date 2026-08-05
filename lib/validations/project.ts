import { z } from "zod";

export const projectTypeSchema = z.enum([
  "RESIDENTIAL",
  "COMMERCIAL",
  "HOSPITALITY",
  "LANDSCAPE",
]);

export const projectImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(160).optional(),
  isHero: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const createProjectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  name: z.string().min(1).max(160),
  location: z.string().min(1).max(120),
  type: projectTypeSchema,
  architect: z.string().min(1).max(120),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  description: z.string().min(1).max(4000),
  technicalInfo: z.string().max(4000).optional(),
  heroImage: z.string().url().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  images: z.array(projectImageSchema).max(30).optional(),
  materialIds: z.array(z.string().cuid()).max(20).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
